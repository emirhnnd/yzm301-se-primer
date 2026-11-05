# Veri sözlüğü: `data/oturumlar.csv`

Her satır **bir kararın** verisidir (bir oturumda 3 satır). Veri, uygulamanın `?veri=1` modunda tarayıcıda
hesaplanır ve oyun sonunda oyuncuya CSV satırı olarak gösterilir. Hiçbir şey sunucuya gönderilmez.

**Toplanmayanlar (KVKK):** ad, e-posta, cihaz kimliği, konum, IP, tutor'a yazılan mesajın içeriği.
`oturum_id` rastgele üretilir; `grup` katılımcıya verilen rastgele etikettir (G1, G2, G3), kimlik değildir.

| Sütun | Anlamı | Birim / değerler |
|---|---|---|
| `oturum_id` | Bir oyun turunun rastgele kimliği (12 hex). Sentetik satırlarda `syn-` ile başlar | metin |
| `grup` | Katılımcı grubu etiketi, çapraz doğrulamada aynı kişinin satırlarını ayırmak için | G1, G2, G3 (sentetikte `SYN`) |
| `kaynak` | Verinin kaynağı | `gercek` \| `sentetik` |
| `karar_no` | Oturumdaki kaçıncı karar | 1, 2, 3 |
| `seviye` | Oyuncunun seçtiği seviye | 0 Yeni, 1 Biraz, 2 Deneyimli |
| `rol` | Oyuncunun seçtiği rol (model özelliği değil, bağlam) | gelistirici, test, urun |
| `hedef` | Oyuncunun seçtiği hedef konu (model özelliği değil, bağlam) | mimari, test, kvkk |
| `ilk_etkilesim_gecikme_sn` | Karar ekranı açıldıktan sonra ilk dokunma, tuş veya kaydırmaya kadar geçen süre. 8 ile sınırlı | saniye, 0–8 |
| `ipucu_kullanildi` | Bu kararda "İpucu göster" kullanıldı mı (tahmin anına kadar) | 0/1 |
| `tutor_mesaj_sayisi` | Bu kararda tutor'a yazılan mesaj sayısı (tahmin anına kadar). İçerik kaydedilmez | adet |
| `sekme_terk_sayisi` | Oturumda sekmenin arka plana düştüğü kez sayısı (tahmin anına kadar) | adet |
| `onceki_panel_okuma_sn` | Önceki kararın "Neden oldu" panelinde "Devam"a basana kadar geçen süre. İlk kararda 0. 120 ile sınırlı | saniye, 0–120 |
| `onceki_riskli_sayisi` | Önceki kararlardan kaçında B (riskli) seçildi | adet, 0–2 |
| `erken_karar` | 1: oyuncu 8. saniyeden önce seçti. Özellikler seçim anında alındı. **Eğitime ve eval'e girmez** | 0/1 |
| `zaman_asimi` | 1: seçimi oyuncu değil süre bitimi yaptı (otomatik B). Etiket davranış değil. **Eğitime ve eval'e girmez** | 0/1 |
| `karar_suresi_sn` | Ekran açılışından seçime kadar geçen süre. **Özellik değil**, seçimden sonra bilinir | saniye |
| `secim` | Seçilen seçenek | A \| B |
| `riskli_secim` | **Etiket.** 1 = B (riskli), 0 = A | 0/1 |

## Tahmin anı
Özellikler karar ekranı açıldıktan **8 saniye sonra** (ya da `erken_karar=1` ise seçim anında) alınır.
`karar_suresi_sn` ve `secim` modele girdi olarak verilmez (veri sızıntısı olur).

## Sentetik veri
`data/uret_sentetik.py`, tohum 13 ile üretir. Kural README.md'de yazılı. **Sentetik veri bir
varsayımdır, kanıt değildir**; eval yalnızca `kaynak=gercek` satırlarında yapılır.
