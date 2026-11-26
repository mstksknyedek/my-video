# Karakter ve animasyon raporu 2: Nermin Teyze + mesaj ekranı (26 Kasım 2026)

**İş:** #1 videosu (7 Aralık, senaryo `03-gunaydin-cicekleri.md`) için gereken iki bileşen çizildi. `tsc` ve
`eslint src/kisacasi` temiz. Kareler render edilip incelendi, bulunan hatalar düzeltildi. `Root.tsx`'e dokunulmadı,
geçici giriş dosyası silindi, commit yapılmadı.

**1. `src/kisacasi/karakterler/NerminTeyze.tsx`**: göğüs çekimi; yuvarlak yüz, topuz + kırmızı toka, kalın siyah
gözlük + sarı gözlük zinciri, inci küpe/kolye, mavi hırka, arkası bize dönük kırmızı kılıflı telefon (sarı çiçek
çıkartması seri işareti). Ortak `animasyon.ts` + `Agiz.tsx` ile çizildi: 8 px kontur, düz renk, kare tabanlı göz kırpma,
nefes ve konuşma. Props: `size`, `ifade` (4'lü), `konusuyor`, `telefonuYaklastiriyor` (boolean ya da 0-1 sayı), `yon`,
`kirpmaGecikmesi`. Yaklaştırınca kafa geriye çekilir, gözler kısılır, kaşlar çatılır, gözlük kayar, telefon titrer.
Şaşkınlıkta gözlük burnun ucuna iner. `KarakterOnizleme.tsx`'e üçüncü karakter olarak eklendi.

**2. `src/kisacasi/MesajEkrani.tsx`**: kanalın kolaj stilinde sahte grup sohbeti. Dışa açılanlar: `MesajEkrani`
(metin/görsel/sistem/"yazıyor"/"Görüldü: N kişi" öğeleri, her biri `kare` + isteğe bağlı `bitis`; yeni mesaj alttan
kayarak yığını iter; `yazamazKaresi`, `titresim`), `BildirimYigini` (06.12 kilit ekranı, bildirimler yığılır, "N yeni"
rozeti), `GrupMenusu` (küçük "Üyeleri çıkar", dev kırmızı "GRUPTAN ÇIK" + basılma), `YuvarlakCerceve` (köşedeki
karakter çerçevesi, kararabilir), `GunaydinGorseli` (gül, çay bardağında kedi silueti, simli çay; kendi SVG'miz).
Kural denetimi uygulandı: yeşil, duvar kâğıdı deseni, balon kuyruğu, tik, "son görülme", logo ve uygulama adı yok;
dinî tebrik yok.

**3. `src/kisacasi/MesajEkraniOnizleme.tsx`**: senaryo 03'ün saniyeleriyle 26 sn'lik animatik (ses/altyazı yok).
Üretimde iskelet olarak kullanılabilir; Root'a eklenmedi.

**Gözlemler:** İlk render'larda 5 hata çıktı ve düzeltildi (telefon ağzı kapatıyordu, kol kadraj dışına taşıyordu,
ekran ışığı yüzü iki tonlu yapıyordu, mesajlar üst üste biniyordu, bildirim saatin üstünden geçiyordu). 150 px'te
4 ifade okunuyor; en zayıf fark sinirli/üzgün arasında. Mesaj yükseklikleri satır kırmayla önceden hesaplanıyor,
çok uzun tek kelimeler (URL gibi) balonu taşırabilir.

**Eksikler:** sahne 7'deki dev başparmak (el çizimi yok, yalnızca düğme basılıyor), Nermin'in kendi ekranı (sahne 10)
için ayrı yerleşim, sesli mesaj pozu (#11 için), kapak karesi (sahne 11) ve altyazı/ses yerleşimi.

## Genel Müdür için öneriler
1. `MesajEkraniOnizleme` ve güncel `KarakterOnizleme`'yi Root'a ekleyin (Studio'da kanal sahibi onayı için hızlı yol).
2. #1'in üretimi animatik üzerinden yürüsün: sıradaki iş ses (`bildirim.wav`, `circir.wav`) + altyazı + kapak karesi;
   bunun için 1-2 iş günü yeterli görünüyor (tahmin).
3. Mesaj ekranının "taklit değil" olduğunu kanal-kural-denetcisi ekran görüntüleri üzerinden bir kez onaylasın.
4. Sonraki çizim işi: dev başparmak + sesli mesaj pozu (Nermin #11), ardından Hamdi Bey.
