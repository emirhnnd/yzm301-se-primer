# RELEASE.md: The Primer v2 davranış modeli

Model: "Tutor ne zaman konuşsun" (lojistik regresyon, sklearn → ONNX, tohum 13).
Model dosyası: `model.onnx` + `config.json` (HF: `<HF_URL_COMMIT_PINLI>`, kod: commit `<GIT_SHA>`).

## 1. Dağıtım stratejisi

Model tarayıcıda (onnxruntime-web) çalışır; sunucu yok. Kademeli açılım bu yüzden **istemci tarafı bayrağıyla** yapılır:
`config.json` içindeki `rollout_yuzde` ve URL parametreleri (`?model=0|1`) modelin açık olup olmadığını belirler.

| Aşama | Ne yapılır | Kim görür | Geçiş koşulu |
|---|---|---|---|
| **Shadow** | Model çalışır, `p` hesaplanır ve kaydedilir (`?debug=1`), ama tutor **konuşmaz**. | Herkes (etkisiz) | Çıkarım hatasız çalışıyor, parite testi yeşil, `p` dağılımı makul (hepsi 0 ya da hepsi 1 değil). |
| **Canary** | Model gerçekten tutor'u tetikler. | Küçük grup (ör. %10; arkadaş grubu) | Oyuncu "tutor gereksiz konuştu" demiyor; hata/çıkarım başarısızlığı yok; regresyon testleri yeşil. |
| **Progressive** | %10 → %50 → %100 | Giderek artan | Her adımda aynı kontroller; bir adım en az bir gözlem turu bekler. |

Veri toplama modunda (`?veri=1`) model **her zaman kapalıdır**: model davranışı etkilerse topladığımız etiket (oyuncunun seçimi) bozulur (geri besleme döngüsü).

## 2. Geri alma (rollback)

- **Hızlı geri alma:** `config.json`'da `rollout_yuzde: 0` yapılır ya da `model.onnx` yüklenemezse uygulama zaten sessizce modelsiz çalışır (tutor yalnızca oyuncu yazınca konuşur = v1 davranışı). Yeniden derleme gerekmez.
- **Tetikleyiciler:** (a) parite testi kırılırsa, (b) regresyon testlerinden biri kırılırsa, (c) çıkarım hata oranı > %1, (d) oyuncular tutor'u "sürekli araya giriyor" diye bildirirse.
- **Önceki sürüm:** HF'de her model sürümü commit ile sabitlenir; geri dönmek, eski commit URL'sine dönmektir.

## 3. Ödünleşim matrisi (trade-off)

| Boyut | A) Modeli tarayıcıda çalıştır (seçilen) | B) Modeli sunucuda çalıştır |
|---|---|---|
| **Ağ** | İlk açılışta ~11 MB wasm + küçük model indirilir, sonra çevrimdışı çalışır | Her tahmin için istek gerekir; çevrimdışı çalışmaz |
| **Gecikme** | Ağ yok; tahmin milisaniye (yerel) ama ilk yükleme yavaş | Her tahmine ağ gidiş-dönüşü eklenir |
| **Veri cihazdan çıkar mı?** | **Hayır.** Davranış sinyalleri cihazda kalır (KVKK açısından güçlü) | **Evet.** Sinyaller sunucuya gider; saklama ve rıza sorumluluğu doğar |
| **Model gizliliği** | Model dosyası herkese açık, indirilip incelenebilir/kopyalanabilir | Model sunucuda gizli kalır |
| **Güncelleme** | Önbellek yüzünden eski model kalabilir; sürümleme gerekir | Tek yerde anında güncellenir |

**Karar:** Veri cihazdan çıkmasın ve ücretsiz/sunucusuz barındırma istendiği için A. Bedeli: model gizli değil ve ilk yükleme ağır. Modelde sır olmadığı için (8 basit davranış özelliği) ikincisi kabul edilebilir.

## 4. Bilinen sınırlar

- Gerçek veri küçük (15+ oturum). Güven aralığı geniştir; eşik (`accuracy ≥ çoğunluk + 0,10`, `recall ≥ 0,60`) eğitimden önce spec §11.2'de sabitlendi ve sonradan değiştirilmedi.
- Sentetik satırlar bir **varsayım**dır, kanıt değildir; ağırlığı 0,3 ve eval'e girmez.
- Model "oyuncu riskli seçecek" der; nedensellik iddia etmez.
