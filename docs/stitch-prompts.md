# Stitch prompt'ları (adım 2)

Sıra: önce **0. Ortak stil** prompt'unu yapıştır, sonra 3 ekranı tek tek üret. Ekran başına bir prompt. İstersen Stitch'te "Mobile" ve "Light" seç.

---

## 0. Ortak stil (ilk mesaj)

```
Design a mobile game UI (360x800 portrait) for "SE Primer: LabLink Krizi", an educational decision game for software engineering students. Setting: a hospital laboratory results system. Visual concept: a clean, calm "lab test result sheet". Light theme only.

Style rules:
- Background #F4F7F6 (paper), cards #FFFFFF with 1px #C9D6D3 borders, NO shadows, corner radius 12px.
- Text #12201F, secondary text #4A5F5C.
- Primary color teal #0B6E69 (buttons, selected states). Selected card background #D7EEEB.
- Status colors: green #1B6B3A on #DDF3E4, amber #8A4B00 on #FFF1D6, red #B3261E on #FDE7E5.
- AI tutor chat bubbles: text #3B3F8F on #E8E9FA, with a small shield icon.
- Fonts: IBM Plex Sans for text, IBM Plex Mono for clock, numbers and values.
- Lab-style status flags: small rounded labels "N" (green), "H" (amber), "L" (red) next to a word.
- Touch targets at least 48px. Body text at least 16px. All UI text in Turkish.
- Do NOT use dark navy backgrounds, orange accents, or serif fonts.
```

## 1. Giriş ekranı

```
Screen 1 of 3: Onboarding / "Giriş".
Top: small wordmark "SE Primer" and subtitle "LabLink Krizi · Akasya Tıp Merkezi".
Headline (IBM Plex Sans 600, 24px): "Nöbet başlamadan üç soru".
Show a 3-step progress indicator "1/3 · 2/3 · 3/3".
Three stacked question cards, each with three selectable option rows (radio style, 48px high):
1) "Seviye?" — "Yeni başladım", "Biraz deneyimliyim" (selected state shown), "Deneyimliyim"
2) "Rolün?" — "Geliştirici" (selected), "Test mühendisi", "Ürün yöneticisi"
3) "Hedefin?" — "Mimari", "Test", "KVKK"
Selected option: teal #D7EEEB background, 2px teal border, check icon.
Below the cards, a small helper text: "Bu cevaplar hikâyeyi sana göre ayarlar. Hiçbiri kaydedilmez."
Bottom: full-width primary button "Nöbete başla".
```

## 2. Sahne ekranı

```
Screen 2 of 3: Game scene / "Sahne".
Top bar: big clock "07:40" in IBM Plex Mono 40px on the left; on the right a chip "Karar 1/3 · Mimari". Under it a thin 60-second countdown bar in teal.
Main card styled like a lab result slip. Tiny uppercase label "SONUÇ EŞLEŞME KAYDI". Narrative text: "Dün gece yeni sürüm çıktı. İki hasta portalda başkasının tahlil sonucunu görmüş. Poliklinik 08:30'da açılıyor, 300 hasta bekliyor. Nöbetçi sensin." Below it two table-like rows in IBM Plex Mono: "Hasta A — Hemogram | Eşleşme: numune sıra no | [H] Yüksek risk" and "Hasta B — Biyokimya | Eşleşme: numune sıra no | [H] Yüksek risk".
Question: "Kaynağı nasıl kapatırsın?"
Two large option cards: "A  Özellik bayrağıyla yeni eşleştirmeyi kapat, eski sisteme dön" and "B  Canlıda hızlı yama yap".
Secondary outlined button with lightbulb icon: "İpucu göster".
Bottom: AI tutor panel. Tutor bubble (indigo-tinted, shield icon, label "AI Tutor"): "Geri dönmeden önce hastaların hangi numarayla eşleştiğini nasıl anlarsın?" Player bubble (teal, white text, right aligned): "Doğru cevap hangisi, A mı B mi?" Then tutor bubble: "Cevabı ben söyleyemem ama sana sorayım: Yamanın kaynağı kapattığını canlıda nasıl kanıtlarsın?" Input field "Tutor'a yaz…" with send button.
Also show, in a collapsed state under the options, a result panel header "Ne oldu / Neden oldu" with a full-width "Devam" button.
```

## 3. Son ekranı

```
Screen 3 of 3: Ending / "Son".
Top: large status badge in green (#DDF3E4 background, check icon): "SON A · KONTROL ALTINDA". Under it the clock "08:15" in IBM Plex Mono 40px and text "Akasya Tıp Merkezi 08:30'da zamanında açıldı."
Section "Senin yolun": three circles in a row connected by a line, labeled K1 Mimari (A), K2 Test (A), K3 KVKK (A), each with a small "N" green flag.
Section "Karar özeti": three compact rows, each with topic label, chosen option text, and one-line reason ("Neden oldu").
Section "Sonraki ders": a card with a short recommendation, e.g. "KVKK: Veri ihlali bildiriminde 72 saatlik süre".
Bottom: primary button "Tekrar oyna" and text button "Farklı yolu dene".
Also include an alternate small variant of the badge for the bad ending in red (#FDE7E5): "SON B · GİZLİ BOMBA" with warning icon, shown as a second smaller frame.
```

---

## Stitch'ten sonra

1. Her ekranın görselini ve HTML/CSS çıktısını indir (ya da Figma'ya aktar).
2. Repoda `/design/` klasörüne koy: `giris.png`, `sahne.png`, `son.png`, `DESIGN.md` (kökte).
3. Çıkan ekranlar `DESIGN.md` ile çelişirse (renk, yazı tipi) Stitch'te "Change fonts to IBM Plex Sans / Mono" gibi bir mesajla düzelttir. Düzeltemezsen DESIGN.md'yi ekrana göre güncelle, çünkü hocaya ikisi birlikte gidiyor.
