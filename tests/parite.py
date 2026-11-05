"""Test kahini (oracle): aynı model.onnx'i Python'da çalıştıran referans tüketici.

Kullanım:
  python tests/parite.py --yaz          # 5 referans girdiyi çalıştırıp tests/parite.json'a yazar
  python tests/parite.py                # parite.json'daki olasılıkları yeniden hesaplayıp karşılaştırır
  python tests/parite.py --model _smoke # başka bir model klasörü (boru hattı denemesi için)

İkinci tüketici uygulamadır (tarayıcıda onnxruntime-web); cypress/e2e/parite.cy.js aynı girdileri
uygulamada çalıştırıp farkı 1e-4 toleransla bu dosyayla karşılaştırır.
"""
import argparse
import json
import sys
from pathlib import Path

import numpy as np
import onnxruntime as ort

BURASI = Path(__file__).resolve().parent
TOLERANS = 1e-4

# Sıra: model/config.json → features (seviye, karar_no, ilk_etkilesim_gecikme_sn, ipucu_kullanildi,
# tutor_mesaj_sayisi, sekme_terk_sayisi, onceki_panel_okuma_sn, onceki_riskli_sayisi)
REFERANS_GIRDILER = [
    [0, 1, 1.0, 0, 0, 0, 0.0, 0],
    [1, 2, 5.5, 1, 1, 0, 12.0, 1],
    [2, 3, 8.0, 0, 0, 2, 3.0, 2],
    [1, 1, 0.2, 0, 0, 0, 0.0, 0],
    [2, 2, 7.1, 1, 2, 1, 45.0, 1],
]


def p_riskli(oturum, girdi):
    x = np.array([girdi], dtype=np.float32)
    olasilik = oturum.run(["probabilities"], {"input": x})[0][0]
    return float(olasilik[1])


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--yaz", action="store_true")
    ap.add_argument("--model", default="model")
    args = ap.parse_args()

    model_yolu = BURASI.parent / args.model / "model.onnx"
    oturum = ort.InferenceSession(str(model_yolu))
    cfg = json.loads((BURASI.parent / args.model / "config.json").read_text(encoding="utf-8"))
    ozellikler = [f["name"] for f in cfg["features"]]
    hedef = BURASI / "parite.json"

    if args.yaz:
        veri = {
            "model": args.model,
            "ozellikler": ozellikler,
            "tolerans": TOLERANS,
            "referanslar": [{"girdi": g, "p_riskli": p_riskli(oturum, g)} for g in REFERANS_GIRDILER],
        }
        hedef.write_text(json.dumps(veri, indent=2), encoding="utf-8")
        print(f"✓ {hedef.name} yazıldı ({len(REFERANS_GIRDILER)} referans girdi)")
        return

    veri = json.loads(hedef.read_text(encoding="utf-8"))
    if veri["ozellikler"] != ozellikler:
        sys.exit("✗ Özellik sırası config.json ile parite.json arasında farklı")
    enbuyuk = 0.0
    for r in veri["referanslar"]:
        enbuyuk = max(enbuyuk, abs(p_riskli(oturum, r["girdi"]) - r["p_riskli"]))
    if enbuyuk >= TOLERANS:
        sys.exit(f"✗ Parite bozuk: maks fark {enbuyuk:.2e} >= {TOLERANS}")
    print(f"✓ Python test kahini kendi kaydıyla tutarlı (maks fark {enbuyuk:.1e})")


if __name__ == "__main__":
    main()
