import { DecisionDefinition, Goal, Level, Role, OptionId } from '../types/game';

export const ROLE_NOTES: Record<'k1' | 'k2' | 'k3', Record<Role, string>> = {
  k1: {
    gelistirici: "Log: match_by=sample_seq (v2.4). 07:12'de iki istek aynı numune sırasına düştü.",
    test: "Test raporu: 'eşzamanlı sorgu' senaryosu v2.4'te hiç yazılmamış.",
    urun: "Şikâyet: 'Portalda başka birinin tahlili var.' Basın ve Kurul riski mevcut.",
  },
  k2: {
    gelistirici: "Deploy kaydı: v2.4 canlıda, v2.3 hazır. Staging'de eşzamanlı yük aracı kurulu.",
    test: "Test ortamında iki sanal kullanıcıyı aynı anda çalıştıran bir araç var, yazmak yaklaşık 15 dk sürer.",
    urun: "Poliklinik 08:30'da açılıyor. Ekip test için 15 dk istiyor, bekleme salonunda 300 hasta var.",
  },
  k3: {
    gelistirici: "Loglarda hasta adı ve numune no düz metin yazıyor. Etkilenen 2 hasta kaydı bulundu.",
    test: "Test verisinde de gerçek ad-soyad kalıntısı olduğunu fark ediyorsun.",
    urun: "Hukuk ekibi soruyor: 'Kurul'a bildirim gerekir mi?' Basın ofisi haber bekliyor.",
  },
};

export const ROLE_LABELS: Record<Role, string> = {
  gelistirici: 'Geliştirici',
  test: 'Test mühendisi',
  urun: 'Ürün yöneticisi',
};

export const ROLE_PERSPECTIVE_LABELS: Record<Role, string> = {
  gelistirici: 'Geliştirici gözüyle',
  test: 'Test mühendisi gözüyle',
  urun: 'Ürün yöneticisi gözüyle',
};

export const GOAL_LABELS: Record<Goal, string> = {
  mimari: 'Mimari',
  test: 'Test',
  kvkk: 'KVKK',
};

export const LEVEL_LABELS: Record<Level, string> = {
  yeni: 'Yeni',
  biraz: 'Orta',
  deneyimli: 'İleri',
};

export const DECISIONS: Record<'k1' | 'k2' | 'k3', DecisionDefinition> = {
  k1: {
    id: 'k1',
    order: '1/3',
    topic: 'Mimari',
    goalMatch: 'mimari',
    question: 'Kaynağı nasıl kapatırsın?',
    options: {
      A: {
        text: 'Özellik bayrağıyla yeni eşleştirmeyi kapat, eski sisteme dön',
        what: (clock) =>
          `${clock} — Yeni eşleştirme özellik bayrağıyla kapandı, portal eski hasta-no eşleştirmesine döndü. Yeni yanlış eşleşme gelmiyor.`,
        why: 'Özellik bayrağı kodu yeniden yayınlamadan davranışı geri alır. Hata kaynağı hızla ve düşük riskle kapanır.',
        minuteAdvance: 10,
      },
      B: {
        text: 'Canlıda hızlı yama yap',
        what: (clock) =>
          `${clock} — Canlıda yama yayınlandı. Yanlış eşleşme azaldı ama kesildiğine dair kanıt yok.`,
        why: 'Canlıda yama, test edilmemiş kod demektir. Yeni hata ekleme riski taşır ve \'düzeldi mi?\' sorusunu cevapsız bırakır.',
        minuteAdvance: 5,
      },
    },
    hint: 'Hatayı kaynağında kapatmak ile üstüne yama atmak arasında geri dönüş süresi açısından ne fark var?',
    deepdive:
      'Özellik bayrağı, yeni kodu sürümden ayırır: kod canlıdadır ama davranış bir anahtarla açılıp kapanır. Geri dönüş dakikalar sürer ve yeniden yayın gerektirmez.',
  },
  k2: {
    id: 'k2',
    order: '2/3',
    topic: 'Test',
    goalMatch: 'test',
    question: 'Düzeltmenin tuttuğunu nasıl kanıtlarsın?',
    options: {
      A: {
        text: 'İki hastanın aynı anda sorgulandığı bir regresyon testi yaz ve koş',
        what: (clock) =>
          `${clock} — İki hastanın aynı anda sorgulandığı regresyon testi koştu. Eski yanlış eşleşme tekrar üretilemedi.`,
        why: 'Hata eşzamanlı isteklerde ortaya çıkıyordu. Test aynı koşulu yeniden kurduğu için düzeltmenin tuttuğunu kanıtlar.',
        minuteAdvance: 15,
      },
      B: {
        text: 'Portala girip birkaç hastaya elle bak, "tamam" de',
        what: (clock) =>
          `${clock} — Portalda birkaç hastaya elle bakıldı, hepsi doğru görünüyor.`,
        why: 'Elle bakmak tek tek durumları görür, eşzamanlı durumları yakalayamaz. \'Görünmeyen\' hata \'yok\' demek değildir.',
        minuteAdvance: 0,
      },
    },
    hint: 'Hata iki hasta aynı anda sorgulandığında çıkıyorsa, tek tek bakmak onu yakalar mı?',
    deepdive:
      'Regresyon testi, daha önce yaşanmış bir hatanın geri gelmediğini otomatik kanıtlar. Eşzamanlılık hataları (race condition) yalnızca iki istek aynı anda geldiğinde görünür.',
  },
  k3: {
    id: 'k3',
    order: '3/3',
    topic: 'KVKK',
    goalMatch: 'kvkk',
    question: 'Olayı nasıl ele alırsın?',
    options: {
      A: {
        text: 'Olayı kayda al, etkilenen 2 hastayı ve kuruma bildirim sürecini başlat, loglardaki kimlikleri maskele',
        what: (clock) =>
          `${clock} — Olay kayda alındı, etkilenen 2 hastaya ve kuruma bildirim süreci başladı, loglardaki kimlikler maskelendi.`,
        why: 'Sağlık verisi özel nitelikli veridir (KVKK m.6). İhlalde Kurul\'a 72 saat içinde bildirim gerekir, kayıt bu süreyi ispatlar.',
        minuteAdvance: 10,
      },
      B: {
        text: '"Sadece 2 kişi, fark etmediler" deyip sessiz geç',
        what: (clock) =>
          `${clock} — Olay kayda alınmadı, kimseye haber verilmedi.`,
        why: '\'Sadece 2 kişi\' demek yükümlülüğü ortadan kaldırmaz. Bildirimsizlik, teknik hatadan ayrı bir hukuki ihlaldir.',
        minuteAdvance: 0,
      },
    },
    hint: 'Sağlık verisi başkasına görününce bu sadece teknik bir hata mı, yoksa başka bir yükümlülük de doğuruyor mu?',
    deepdive:
      'Sağlık verisi KVKK m.6\'da özel nitelikli sayılır. Kurul kararına göre ihlal öğrenildiğinde 72 saat içinde bildirim yapılır. Loglarda kimlik maskeleme ikinci bir koruma katmanıdır.',
  },
};

export const PATH_REASONS: Record<string, string> = {
  'A-A-A': 'Kaynak kapalı, düzeltme kanıtlı, bildirim yapıldı.',
  'A-B-A': 'Bayrak kaynağı kapattı, bildirim yapıldı. Test eksikti, risk düşük kaldı.',
  'B-A-A': 'Yama riskliydi ama testle yakalandı, bildirim yapıldı.',
  'A-A-B': 'Teknik olarak temiz ama olay gizlendi: KVKK ihlali sürüyor.',
  'A-B-B': 'Kaynak kapalı ama ne test ne bildirim yapıldı.',
  'B-A-B': 'Teknik olarak doğrulandı ama olay gizlendi.',
  'B-B-A': 'Yama kanıtsız kaldı, yanlış eşleşme tekrarladı.',
  'B-B-B': 'Hem sızıntı hem gizleme: üçüncü bir hasta fark edip şikâyet etti.',
};

export const NEXT_LESSONS: Record<Goal, string> = {
  mimari: 'Özellik bayrağı (feature flag) ve geri alma stratejileri',
  test: 'Eşzamanlılık (race condition) hatalarında regresyon testi yazmak',
  kvkk: 'KVKK: Veri ihlali bildiriminde 72 saatlik süre',
};

/**
 * Clock calculation: starts at "07:40".
 * Formatted as "HH:MM".
 */
export function advanceClock(current: string, minutesToAdd: number): string {
  const [hStr, mStr] = current.split(':');
  let hours = parseInt(hStr, 10);
  let minutes = parseInt(mStr, 10) + minutesToAdd;
  while (minutes >= 60) {
    hours += 1;
    minutes -= 60;
  }
  const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
  return `${pad(hours)}:${pad(minutes)}`;
}

/**
 * Determine ending based on strict requirement:
 * K3 = A ve (K1 = A veya K2 = A) ise SON A, aksi halde SON B.
 */
export function determineEnding(k1: OptionId, k2: OptionId, k3: OptionId): 'A' | 'B' {
  if (k3 === 'A' && (k1 === 'A' || k2 === 'A')) {
    return 'A';
  }
  return 'B';
}
