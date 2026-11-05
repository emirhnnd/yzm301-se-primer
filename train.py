"""The Primer v2 davranış modeli: tekrarlanabilir eğitim ve eval kapısı.

Tek komut:   python train.py
Boru hattı denemesi (yayına uygun DEĞİL):   python train.py --smoke

Ne yapar:
 1. data/oturumlar.csv okur. erken_karar=1 ve zaman_asimi=1 satırları dışarıda kalır.
 2. Eval YALNIZCA kaynak=gercek satırlarında, katılımcı grubuna göre ayrılmış çapraz doğrulamayla
    (LeaveOneGroupOut) yapılır. Sentetik satırlar yalnızca eğitimde, düşük ağırlıkla kullanılır.
 3. Kabul eşiği (spec.md 11.2) sağlanmazsa HATA verip durur; model.onnx yazılmaz.
 4. Eşik sağlanırsa son modeli (gerçek + ağırlıklı sentetik) eğitir, model/model.onnx,
    model/config.json, model/README.md yazar. ONNX, sklearn'den 1e-4'ten fazla saparsa durur.

Sabit tohum 13. Aynı veri + aynı sürümler = aynı sonuç.
"""
import argparse
import hashlib
import json
import math
import shutil
import sys
from pathlib import Path

import numpy as np
import pandas as pd
import sklearn
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, recall_score
from sklearn.model_selection import LeaveOneGroupOut
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler

SEED = 13
BURASI = Path(__file__).resolve().parent
VERI = BURASI / "data" / "oturumlar.csv"
OZELLIKLER = ["seviye", "karar_no", "ilk_etkilesim_gecikme_sn", "ipucu_kullanildi",
              "tutor_mesaj_sayisi", "sekme_terk_sayisi", "onceki_panel_okuma_sn",
              "onceki_riskli_sayisi"]
HEDEF = "riskli_secim"

# Kabul eşiği: spec.md bölüm 11.2. Eğitimden ÖNCE yazıldı, eğitimden sonra değiştirilmez.
ESIK_DOGRULUK_FARKI = 0.10   # doğruluk, çoğunluk sınıfı doğruluğundan en az bu kadar yüksek
ESIK_RECALL_RISKLI = 0.60    # riskli seçim için duyarlılık
MIN_GERCEK_SATIR = 30        # bunun altında ölçüm anlamsız sayılır, eğitim durur
SENTETIK_AGIRLIK = 0.3       # sentetik satırların eğitimdeki ağırlığı
KARAR_ESIGI = 0.5            # uygulamada p_riskli >= bu ise tutor kendiliğinden soru sorar


def model_kur():
    return Pipeline([("scaler", StandardScaler()),
                     ("lr", LogisticRegression(random_state=SEED, max_iter=1000,
                                               class_weight="balanced"))])


def wilson(k, n, z=1.96):
    if n == 0:
        return (0.0, 1.0)
    p = k / n
    d = 1 + z * z / n
    c = p + z * z / (2 * n)
    m = z * math.sqrt(p * (1 - p) / n + z * z / (4 * n * n))
    return ((c - m) / d, (c + m) / d)


def veri_oku():
    df = pd.read_csv(VERI)
    kullanilabilir = df[(df["erken_karar"] == 0) & (df["zaman_asimi"] == 0)].copy()
    return df, kullanilabilir


def agirliklar(df):
    return np.where(df["kaynak"] == "sentetik", SENTETIK_AGIRLIK, 1.0)


def capraz_dogrula(gercek, sentetik):
    """Katılımcı grubuna göre ayrılmış çapraz doğrulama. Eval yalnız gerçek satırlarda."""
    gruplar = gercek["grup"].to_numpy()
    if len(set(gruplar)) < 2:
        sys.exit("✗ Çapraz doğrulama için en az 2 farklı katılımcı grubu (grup) gerekir.")
    y_gercek = gercek[HEDEF].to_numpy()
    tahmin = np.zeros(len(gercek), dtype=int)
    for tr, te in LeaveOneGroupOut().split(gercek, y_gercek, gruplar):
        egitim = pd.concat([gercek.iloc[tr], sentetik])
        y = egitim[HEDEF].to_numpy()
        if len(set(y)) < 2:
            sys.exit("✗ Bir eğitim kıvrımında tek sınıf var; daha fazla ve daha çeşitli gerçek veri gerekir.")
        m = model_kur()
        m.fit(egitim[OZELLIKLER], y, lr__sample_weight=agirliklar(egitim))
        tahmin[te] = (m.predict_proba(gercek.iloc[te][OZELLIKLER])[:, 1] >= KARAR_ESIGI).astype(int)
    n = len(y_gercek)
    dogru = int((tahmin == y_gercek).sum())
    cogunluk = max(int(y_gercek.sum()), n - int(y_gercek.sum())) / n
    lo, hi = wilson(dogru, n)
    return {
        "dogruluk": round(dogru / n, 4),
        "dogruluk_ci95": [round(lo, 4), round(hi, 4)],
        "cogunluk_siniflama_dogrulugu": round(cogunluk, 4),
        "recall_riskli": round(float(recall_score(y_gercek, tahmin, pos_label=1, zero_division=0)), 4),
        "n_gercek_satir": n,
        "n_riskli": int(y_gercek.sum()),
        "n_grup": len(set(gruplar)),
    }


def kapi(m):
    sorunlar = []
    if m["dogruluk"] < m["cogunluk_siniflama_dogrulugu"] + ESIK_DOGRULUK_FARKI:
        sorunlar.append(f"doğruluk {m['dogruluk']} < çoğunluk {m['cogunluk_siniflama_dogrulugu']} + {ESIK_DOGRULUK_FARKI}")
    if m["recall_riskli"] < ESIK_RECALL_RISKLI:
        sorunlar.append(f"riskli duyarlılığı {m['recall_riskli']} < {ESIK_RECALL_RISKLI}")
    return sorunlar


def onnx_yaz(model, X, cikti):
    import onnxruntime as ort
    from skl2onnx import to_onnx
    from skl2onnx.common.data_types import FloatTensorType

    onx = to_onnx(model, initial_types=[("input", FloatTensorType([None, X.shape[1]]))],
                  options={id(model): {"zipmap": False}}, target_opset=17)
    yol = cikti / "model.onnx"
    yol.write_bytes(onx.SerializeToString())
    oturum = ort.InferenceSession(str(yol))
    p_onnx = oturum.run(["probabilities"], {"input": X.to_numpy(np.float32)})[0]
    fark = float(np.abs(p_onnx - model.predict_proba(X.astype(np.float32))).max())
    if fark > 1e-4:
        sys.exit(f"✗ ONNX çıktısı sklearn'den sapıyor (maks fark {fark:.2e})")
    print(f"✓ model.onnx üretildi (sklearn ile maks fark {fark:.1e})")
    return fark


def model_karti(cfg):
    m = cfg["metrics"]
    return f"""# The Primer v2 davranış modeli (model kartı)

## Amaç
Karar ekranı açıldıktan 8 saniye sonra, oyuncunun o ana kadarki davranışından **riskli seçeneği (B)
seçme olasılığını** tahmin eder. Olasılık `karar_esigi` ({cfg['karar_esigi']}) ve üstündeyse oyundaki tutor,
oyuncu yazmadan, düşündüren tek bir soru sorar. Altındaysa susar.

## Girdi ve çıktı
- Girdi `input`, float32 `[n, {len(cfg['features'])}]`, sıra `config.json → features`.
- Çıktı `probabilities` `[n, 2]`, sıra `config.json → classes` (`0` güvenli, `1` riskli).
- Model: `Pipeline(StandardScaler → LogisticRegression(class_weight=balanced))`, tohum {cfg['seed']}.

## Veri
- Gerçek: {cfg['data']['n_gercek_kullanilabilir']} kullanılabilir satır, {m['n_grup']} katılımcı grubu (uygulamanın veri toplama modu).
- Sentetik: {cfg['data']['n_sentetik']} satır, eğitimde ağırlık {cfg['sentetik_agirlik']}. Sentetik üretici kural bir **varsayımdır**
  (bkz. `data/uret_sentetik.py`); eval'e girmez.
- Dışarıda bırakılanlar: `erken_karar=1` (8. saniyeden önce seçim) ve `zaman_asimi=1` (süre bitimi otomatik B).

## Metrikler (yalnızca gerçek satırlar, katılımcı grubuna göre ayrılmış çapraz doğrulama)
| Metrik | Değer |
|---|---|
| Doğruluk | {m['dogruluk']} (%95 güven aralığı {m['dogruluk_ci95'][0]}–{m['dogruluk_ci95'][1]}) |
| Çoğunluk sınıfını hep tahmin eden model | {m['cogunluk_siniflama_dogrulugu']} |
| Riskli seçim duyarlılığı (recall) | {m['recall_riskli']} |
| Satır sayısı / riskli sayısı | {m['n_gercek_satir']} / {m['n_riskli']} |

**Kabul eşiği** (eğitimden önce yazıldı): doğruluk ≥ çoğunluk + {ESIK_DOGRULUK_FARKI} ve riskli duyarlılığı ≥ {ESIK_RECALL_RISKLI}. Bu sürüm eşiği geçti.

## Sınırlar
- Çok az veri ({m['n_gercek_satir']} satır, {m['n_grup']} kişi). Güven aralığı geniştir; sonuç genellenemez.
- Veri tek bir senaryodan (LabLink Krizi) ve arkadaş çevresinden gelir.
- Sentetik satırlar modeli kendi varsayımıma doğru çekmiş olabilir.

## Kullanılmaması gereken durumlar
- Gerçek öğrenci değerlendirmesi, not verme veya bir kişi hakkında karar için **kullanılmaz**.
- Başka senaryolar, başka yaş grupları veya başka cihazlar için doğrulanmadı.
- İstemcide çalışan model herkese açıktır; hassas veriyle eğitilmedi.
"""


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--smoke", action="store_true", help="boru hattı denemesi, yayına uygun değil")
    args = ap.parse_args()

    tum, kullan = veri_oku()
    gercek = kullan[kullan["kaynak"] == "gercek"].reset_index(drop=True)
    sentetik = kullan[kullan["kaynak"] == "sentetik"].reset_index(drop=True)
    print(f"veri: toplam {len(tum)}, kullanılabilir gerçek {len(gercek)}, sentetik {len(sentetik)}")

    if args.smoke:
        # Eval'i gerçek veri yerine sentetikte yapar: SADECE boru hattını denemek için.
        gercek = sentetik.copy()
        gercek["grup"] = [f"S{int(hashlib.md5(o.encode()).hexdigest(), 16) % 3}" for o in gercek["oturum_id"]]
        sentetik = sentetik.iloc[0:0]
        cikti = BURASI / "_smoke"
    else:
        cikti = BURASI / "model"
        if len(gercek) < MIN_GERCEK_SATIR:
            sys.exit(f"✗ Yeterli gerçek veri yok: {len(gercek)} < {MIN_GERCEK_SATIR} kullanılabilir gerçek satır. "
                     "Model yayınlanmaz. Daha fazla gerçek oturum toplayın.")

    metrikler = capraz_dogrula(gercek, sentetik)
    print("metrikler:", json.dumps(metrikler, ensure_ascii=False))
    sorunlar = kapi(metrikler)
    if sorunlar and not args.smoke:
        sys.exit("✗ Kabul eşiği sağlanmadı, artefakt yayınlanmıyor: " + "; ".join(sorunlar))
    if sorunlar:
        print("(smoke) eşik sağlanmadı, normal modda burada dururdu:", "; ".join(sorunlar))

    egitim = pd.concat([gercek, sentetik])
    model = model_kur()
    model.fit(egitim[OZELLIKLER], egitim[HEDEF], lr__sample_weight=agirliklar(egitim))

    if cikti.exists():
        shutil.rmtree(cikti)
    cikti.mkdir(parents=True)
    fark = onnx_yaz(model, egitim[OZELLIKLER], cikti)

    ornek = egitim[OZELLIKLER].iloc[0]
    cfg = {
        "title": "The Primer v2 davranış modeli",
        "description": "Karar ekranındaki davranıştan riskli seçim (B) olasılığını tahmin eder. "
                       "Öğrenci değerlendirmesi için KULLANILMAZ.",
        "target": HEDEF,
        "class_labels": {"0": "guvenli", "1": "riskli"},
        "features": [{"name": c, "label": c, "example": float(ornek[c])} for c in OZELLIKLER],
        "classes": [str(c) for c in model.classes_],
        "metrics": metrikler,
        "esik": {"dogruluk_farki": ESIK_DOGRULUK_FARKI, "recall_riskli": ESIK_RECALL_RISKLI,
                 "min_gercek_satir": MIN_GERCEK_SATIR, "gecti": not sorunlar},
        "karar_esigi": KARAR_ESIGI,
        "sentetik_agirlik": SENTETIK_AGIRLIK,
        "data": {"n_gercek_kullanilabilir": int(len(gercek)), "n_sentetik": int(len(sentetik))},
        "onnx_sklearn_maks_fark": fark,
        "seed": SEED,
        "sklearn_version": sklearn.__version__,
        "python_version": f"{sys.version_info.major}.{sys.version_info.minor}",
        "smoke": bool(args.smoke),
    }
    (cikti / "config.json").write_text(json.dumps(cfg, indent=2, ensure_ascii=False), encoding="utf-8")
    if not args.smoke:
        (cikti / "README.md").write_text(model_karti(cfg), encoding="utf-8")
    print(f"✓ {'SMOKE (yayına uygun değil)' if args.smoke else 'model'} → {cikti}")


if __name__ == "__main__":
    main()
