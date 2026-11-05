"""Sentetik oturum verisi üretici (tohum 13).

Kullanım:  python data/uret_sentetik.py [satir_sayisi]
`data/oturumlar.csv` içindeki eski `kaynak=sentetik` satırlarını siler, yenilerini ekler.
Gerçek satırlara dokunmaz. Aynı tohum = aynı çıktı.

ÖNEMLİ: Bu kural benim VARSAYIMIM (hipotezim), ölçülmüş bir bulgu değil. Sentetik veriyle
eğitilen model yalnızca bu varsayımı geri öğrenir. Bu yüzden eval'e girmez (train.py).

Üretici kural: p(riskli) = sigmoid(b + w · x), x özelliklerin basit rastgele örnekleri.
  + ilk etkileşim gecikmesi (tereddüt) artar → risk artar
  + sekme terk sayısı artar → risk artar
  + önceki riskli seçim sayısı → risk artar
  + deneyimli seviye (süre baskısı) → risk artar
  - ipucu kullanıldı → risk azalır
  - tutor'a yazdı → risk azalır
  - önceki paneli uzun okudu → risk azalır
"""
import csv
import math
import random
import sys
from pathlib import Path

SEED = 13
YOL = Path(__file__).resolve().parent / "oturumlar.csv"
SUTUNLAR = ["oturum_id", "grup", "kaynak", "karar_no", "seviye", "rol", "hedef",
            "ilk_etkilesim_gecikme_sn", "ipucu_kullanildi", "tutor_mesaj_sayisi",
            "sekme_terk_sayisi", "onceki_panel_okuma_sn", "onceki_riskli_sayisi",
            "erken_karar", "zaman_asimi", "karar_suresi_sn", "secim", "riskli_secim"]
ROLLER = ["gelistirici", "test", "urun"]
HEDEFLER = ["mimari", "test", "kvkk"]


def sigmoid(z):
    return 1 / (1 + math.exp(-z))


def uret_oturum(rng, no):
    seviye = rng.choice([0, 1, 2])
    rol, hedef = rng.choice(ROLLER), rng.choice(HEDEFLER)
    sekme = 0
    onceki_okuma, onceki_riskli = 0.0, 0
    satirlar = []
    for k in (1, 2, 3):
        gecikme = min(8.0, rng.expovariate(1 / 3.0))
        ipucu = 1 if (seviye < 2 and rng.random() < 0.35) else 0
        tutor = 1 if rng.random() < 0.15 else 0
        sekme += 1 if rng.random() < 0.10 else 0
        z = (-0.9 + 0.22 * gecikme + 0.55 * sekme + 0.60 * onceki_riskli + 0.35 * (seviye == 2)
             - 0.80 * ipucu - 0.70 * tutor - 0.020 * onceki_okuma)
        riskli = 1 if rng.random() < sigmoid(z) else 0
        erken = 1 if rng.random() < 0.15 else 0
        zaman = 1 if (seviye == 2 and rng.random() < 0.05) else 0
        if zaman:
            riskli = 1  # süre bitince otomatik B
        karar_suresi = round(gecikme + rng.uniform(1, 25), 2)
        satirlar.append({
            "oturum_id": f"syn-{no:05d}", "grup": "SYN", "kaynak": "sentetik", "karar_no": k,
            "seviye": seviye, "rol": rol, "hedef": hedef,
            "ilk_etkilesim_gecikme_sn": round(gecikme, 2), "ipucu_kullanildi": ipucu,
            "tutor_mesaj_sayisi": tutor, "sekme_terk_sayisi": sekme,
            "onceki_panel_okuma_sn": round(onceki_okuma, 2), "onceki_riskli_sayisi": onceki_riskli,
            "erken_karar": erken, "zaman_asimi": zaman, "karar_suresi_sn": karar_suresi,
            "secim": "B" if riskli else "A", "riskli_secim": riskli,
        })
        onceki_riskli += riskli
        onceki_okuma = min(120.0, rng.expovariate(1 / 8.0))
    return satirlar


def main():
    n_satir = int(sys.argv[1]) if len(sys.argv) > 1 else 300
    rng = random.Random(SEED)
    mevcut = []
    if YOL.exists():
        with YOL.open(encoding="utf-8", newline="") as f:
            mevcut = [r for r in csv.DictReader(f) if r["kaynak"] != "sentetik"]
    yeni = []
    for i in range(n_satir // 3):
        yeni.extend(uret_oturum(rng, i + 1))
    with YOL.open("w", encoding="utf-8", newline="") as f:
        w = csv.DictWriter(f, fieldnames=SUTUNLAR)
        w.writeheader()
        w.writerows(mevcut + yeni)
    print(f"gerçek: {len(mevcut)} satır, sentetik: {len(yeni)} satır → {YOL}")


if __name__ == "__main__":
    main()
