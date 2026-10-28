# SE Primer: LabLink Krizi

YZM301 Yazılım Gerçekleme ve Test · Ödev 6 "AI tutor: SE Primer" · Emirhan Dede

Telefonda açılan kısa bir karar oyunu. Sen bir hastane laboratuvar sistemi (LabLink) için nöbetçi yazılımcısın. Yeni sürüm yüzünden iki hastanın tahlil sonucu başkasına görünmüş. 3 karar verirsin (mimari, test, KVKK), her kararın sonucunu ve nedenini görürsün. Yanındaki AI tutor **cevabı söylemez, soru sorar**. Oyun seviyene, rolüne ve hedefine göre uyarlanır. Senaryo kurgusaldır, gerçek hasta verisi yoktur.

## Bağlantılar
- Uygulama (AI Studio): https://ai.studio/apps/47805561-4642-4b66-a6f8-74f6fa870f67
- Demo video (60 sn): **VIDEO_LINKI_YAZ**
- Depo: bu sayfa

## Neler var

| Klasör / dosya | İçerik |
|---|---|
| `spec.md` | Problem, senaryo, durum makinesi, 8 yolun tablosu, kişiselleştirme, tutor kuralları, kabul örnekleri |
| `DESIGN.md`, `design/` | Google Stitch tasarım sistemi ("Clinical Diagnostic Paper") ve 3 ekran (giriş, sahne, son) |
| `docs/` | Stitch prompt'ları, AI Studio'ya verilen uygulama prompt'u |
| `app/` | AI Studio'dan alınan uygulama kodu (React + TypeScript) |
| `eval/` | Tutor değerlendirmesi: vakalar, prompt'lar, çalıştırıcı, rapor |
| `cypress/` | Uçtan uca testler |

## Nasıl çalışır
- Durum makinesi: başlangıç 07:40. K1 A +10 / B +5 dk, K2 A +15 / B +0, K3 A +10 / B +0.
- **SON A** ancak K3=A ve (K1=A veya K2=A) ise. Aksi halde **SON B**. Sekiz yolun hepsi `spec.md` içindeki tabloda, Cypress ile doğrulanır.
- Seviye: *Yeni* süre yok, sınırsız ipucu. *Biraz* 120 sn ve karar başına 1 ipucu. *Deneyimli* 60 sn, ipucu yok, süre dolunca B uygulanır.
- Rol: sahnede tek satırlık role özel not. Hedef: o konudaki kararda "Derinleşme" paragrafı ve son ekranda "Sonraki ders" kartı.
- Hiçbir şey saklanmaz: hesap, çerez, `localStorage` yok.

## AI tutor ve güvenlik kararları
1. **Sistem prompt'unda doğru cevap hiç yok.** Tutor cevabı bilmediği için, kandırılsa bile ele veremez. Bu bilinçli bir ürün kararı.
2. **Koruma katmanı (`checkGuard`):** Yanıtta soru işareti yoksa ya da seçenek harfi ile "doğru/yanlış/daha iyi" gibi hüküm kelimesi aynı cümledeyse yanıt atılır, yerine o karara ait sabit ipucu sorusu gösterilir.
3. **Girdi temizleme:** 11 haneli sayılar (TC kimlik benzeri) modele gitmeden `[KİMLİK]` olur. Mesajlar saklanmaz.
4. **Çevrimdışı ipucu:** Gemini kotası dolarsa ya da servis hata verirse model zinciri denenir, olmazsa oyun sabit ipucu ile devam eder, hiçbir zaman çökmez.
5. **`?tutor=mock`:** Testler gerçek API'ye gitmez, sabit bir yanıt alır.

## Tutor değerlendirmesi
`eval/` içinde 30 vaka var (doğrudan soru, yönlendirme, talimat ezme, kişisel veri, masum bilgi, alan dışı). Yanıtlar elle etiketlendi (OK, H1–H8), hata oranı ve örnek sayısı raporlandı. Ayrıntı: `eval/README.md`, sonuçlar `eval/report-*.md`.

- **v1** (gemini-3.1-flash-lite, 20 vaka): 1/20 hatalı (%5, %95 güven aralığı %1–24). Hata: E05, tutor "hız odaklı yaklaşım süreyi etkileyebilir" diyerek bir seçeneğin bedeli olduğunu ima etti (H2).
- **Düzeltme:** Prompt'a, seçeneklerin hızı/riski/sonucu hakkında hüküm ya da ima yasağı ve "haklı mıyım?" sorusuna nasıl yanıt verileceği eklendi.
- **v2:** SONUCLAR_EKLENECEK
- **Sınırlar:** Küçük örneklem, tek turluk mesajlar, ücretsiz katman kotası yüzünden koşular farklı günlerde yapıldı, ilk etiket taslağı Claude ile hazırlanıp benim tarafımdan gözden geçirildi.

## Testler
```
npm install
$env:CYPRESS_BASE_URL="UYGULAMA_LINKI"
npx cypress run
```
8 yol, kabul örnekleri (KÖ-1…KÖ-5), zaman aşımı, kişiselleştirme ve erişilebilirlik kontrolleri.

## Yapmadığım 3 özellik (bilerek)
1. **Hesap ve ilerleme kaydı.** Gizlilik ve kapsam nedeniyle hiçbir şey saklanmıyor. Eksisi: öğrenci ilerlemesini, tekrar sayısını ya da hangi kararlarda zorlandığını göremiyor. Eklemek için KVKK aydınlatma metni ve açık rıza gerekirdi.
2. **İkinci senaryo ve daha fazla karar.** Tek senaryo, 3 karar. Daha derin öğrenme için farklı alanlar (CI/CD, güvenlik açığı, performans) gerekir, ama sekiz yol ve test kapsamı katlanırdı.
3. **Gerçek zamanlı tutor hafızası ve sesli arayüz.** Tutor her mesajı tek başına yanıtlıyor, sohbet geçmişini taşımıyor. Hem saldırı yüzeyi (uzun sohbette talimat ezme) hem kota maliyeti artacağı için bilerek yapmadım. Ayrıca sesli giriş ve ekran okuyucu için gelişmiş anlatım yok.

## Lisans / not
Eğitim amaçlı ödev. Kurum ve hasta adları kurgusaldır.
