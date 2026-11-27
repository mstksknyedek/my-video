# Görev: Video 3 "Annenin kapları geri dönmez" montajı

Ajan türü: general-purpose. Proje: /home/user/my-video (Remotion).

Brifin ortak kuralları (CLAUDE.md, skill rehberleri, netlik, referans videolar, güvenli alan, ses efektleri, şablon çeşitliliği, doğrulama, ses ustalığı, commit yasağı, rapor biçimi) `strategy/gorevler/06-karinca-montaj.md` dosyasındaki "Genel kurallar" bölümüyle AYNIDIR; onu oku ve aynen uygula.

## Bu videoya özel
- Senaryo: `strategy/senaryolar/05-annenin-kaplari.md` (üstteki "Genel Müdür notları" zorunlu); ses: `public/voice/05-kaplar/` (anlatici + anne, Leda); Composition id `Video05AnneninKaplari`; çıktı `out/video05-kaplar.mp4`.
- Yeni karakter ÇİZ: `src/kisacasi/karakterler/Anne.tsx` (senaryo §7: kısa dalgalı koyu saç, gözlük yok, kırmızı önlük, sarı bluz, elinde kepçe; Kazım/Nermin/Uğur Hoca ile aynı stil: #111111 8 px kontur, düz renkler, useCurrentFrame ile göz kırpma/nefes, ortak `animasyon.ts` ve `Agiz.tsx`; ifadeler mutlu/saskin/sinirli/uzgun, `konusuyor`). Sevecen çizim, aşağılama yok.
- Ayırt edici görsel araç: kap yığını sayacı ("7 KAP GÖTÜRDÜM → 9 KAPLA DÖNDÜM"), kapların yemekle dolup üst üste dizilmesi; punchline yazısı büyük, ≥1,5 sn.
- Marka adı (Tupperware vb.) hiçbir yerde görünmez; kaplar düz, markasız.
