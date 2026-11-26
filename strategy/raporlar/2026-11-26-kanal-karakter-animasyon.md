# Karakter ve animasyon raporu — 26 Kasım 2026

**Yapılan:** Kazım ve Uğur Hoca, Remotion'da yeniden kullanılabilir SVG bileşenleri olarak çizildi.

- `src/kisacasi/karakterler/Kazim.tsx` — props: `size`, `ifade`, `konusuyor`, `yuruyor`, isteğe bağlı `yon`, `kirpmaGecikmesi`.
- `src/kisacasi/karakterler/UgurHoca.tsx` — props: `size`, `ifade`, `konusuyor`, `tebesirSalliyor`, `yon`, `kirpmaGecikmesi`.
- Ortak parçalar: `animasyon.ts` (palet, göz kırpma, nefes, konuşma ağzı) ve `Agiz.tsx` (tüm karakterler için ağız).
  Yeni karakter eklerken bunlar hazır; yalnızca gövde çizilir.
- `KarakterOnizleme.tsx` — 1080x1920, 6 sn: iki karakter ifade değiştirir, altta 4 ifadenin sabit referans satırı.
- Her şey `useCurrentFrame` ile; CSS animasyonu yok. `tsc` ve `eslint` temiz. Kareler render edilip gözle kontrol edildi.
- Rehber: `strategy/bilgi/karakterler.md` (Hamdi Bey ve Nermin Teyze için rehber notu dahil).

**Gözlemler**
- 210 px'te bile 4 ifade ayırt ediliyor; ifadeyi kaş + ağız + tek bir işaret (öfke işareti, gözyaşı, şok çizgisi) taşıyor.
- Siyah kafalı karakterde yüz detayları açık renkle çizilmeli (Uğur Hoca'da beyaz kaş ve bıyık bu yüzden var).
- İfadeler anında değişiyor; geçiş animasyonu (ör. 4 karede kaş kayması) yok. Kurgu kesmeleriyle sorun değil,
  uzun planda sertlik görülebilir.

**Eksikler / sonraki adım**
- Senaryo 01'in istediği Kazım hareketleri bileşende yok: tek kaş kaldırma, yanak şişirip morarma,
  bükük antenin yavaşça düşmesi, kameraya dönük kapak pozu.
- Konuşma ağzı ses dosyasından değil ritimden üretiliyor; gerçek dudak senkronu için ses genliği okunmalı
  (`@remotion/media-utils` visualizeAudio; **doğrulanmalı**: paket projede kurulu değil).

## Genel Müdür için öneriler
1. Yayın planında 1. video Nermin Teyze (7 Ara); karakteri henüz çizilmedi. Sıradaki çizim işi Nermin Teyze olsun, sonra Hamdi Bey.
2. Senaryo 01 için Kazım'a `kasKaldir`, `yanakSisik`, `antenDusuk` prop'larını eklememe izin verin (yaklaşık yarım günlük iş).
3. `KarakterOnizleme`'yi Root'a ekleyin; yeni karakter geldikçe aynı sayfaya eklenir, kalite kontrolü için tek referans olur.
