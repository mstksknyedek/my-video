# Görev: Video 2 "Sinek neden sofraya konar?" montajı

Ajan türü: general-purpose · Proje: /home/user/my-video (Remotion). Önce CLAUDE.md'yi, sonra `.claude/skills/remotion-best-practices/SKILL.md` ve onun remotion-markup, remotion-interactivity, remotion-captions rehberlerini oku.

## Girdiler
- Senaryo: `strategy/senaryolar/02-sinek-sofraya-konar.md`. ÜSTTEKİ NOTLARI OKU: sahne 5 (sofra misafiri) ÇIKARILDI; sınıf YETİŞKİN görünmeli (tahtanın köşesinde küçük "Akşam Kursu" yazısı; yaklaşık bir saniye yetişkin böcekler: çay bardağıyla esneyen hamamböceği ya da sırt çantalı Kazım). Uğur Hoca'nın imzası "Kısacası millet… Ders bitti!" ("çocuklar" asla).
- Netlik kuralı: iki bilgi (sinek ayağıyla tadar; tükürükle yumuşatıp emer) ekranda BÜYÜK yazıyla da okunabilmeli.
- Seslendirme HAZIR, yeniden üretme: `public/voice/02-sinek/NN-ugur-hoca.mp3` + `zamanlama.json` (baştaki sessizlik kırpılmış; her Audio satır başlangıcında başlar). 6 satır, 21,6 sn konuşma.
- Referans (aynı stilde biten videolar): `src/kisacasi/videolar/Video01SesliMesaj.tsx` (en yenisi) ve `Video01AileGrubu.tsx`.
- Bileşenler: `src/kisacasi/karakterler/UgurHoca.tsx`, `Kazim.tsx`, `animasyon.ts`, `Agiz.tsx`, `ShortsCaptions.tsx`, `LogoBadge.tsx`, `PaperBackground.tsx`, `fonts.ts`.
- Ses efektleri `public/sfx/` (kaynaklar `public/sfx/KAYNAKLAR.md`). Senaryo `okul-zili` ister (tanınan bir jingle OLMAMALI), belki `tebesir`, `slurp`: earshot ile üret (`earshot make "<english>" -o sounds/generated/<ad>.wav`), `public/sfx/`'e kopyala, KAYNAKLAR.md'ye ekle, `python3 scripts/setup_sounds.py` çalıştır.

## Yapılacaklar
1. `src/kisacasi/karakterler/Sinek.tsx`: karasinek (aynı stil: #111111 8 px kontur, düz renkler, useCurrentFrame ile göz kırpma/rölanti, CSS animasyonu yok), büyük kırmızı gözler, küçük kanatlar, altı bacak; props: size, bacak dansı. Sevimli-tiksindirici, gerçekçi değil.
2. Kolaj stilinde arka planlar: kara tahta (tebeşir çizimleri stroke-dashoffset ile kendini çizer), ekmek yakın planı, 3 adımlı tükürük/yumuşatma/emme şeması. Marka/okul logosu yok.
3. `src/kisacasi/videolar/Video02Sinek.tsx` (1080x1920, 30 fps), sahneler gerçek ses sürelerine göre + nefes payı, hedef ~24-26 sn. Kapak karesi (0,6-0,8 sn, altyazısız): "SİNEK AYAĞIYLA TADAR". Döngü: son sahne ilkine bağlanır. Altyazı: ShortsCaptions, zamanlama.json'dan INLINE dizi; "Seslendirme" Track (~0,9), "Ses efektleri" Track (0,3-0,6).
4. `src/Root.tsx`'te `<Folder name="Kisacasi">` içine `<Composition id="Video02Sinek" ...>` (literal durationInFrames).
5. Doğrula: `npx tsc --noEmit`, `npx eslint src` temiz. Her sahnenin karesini `npx remotion still Video02Sinek <dosya> --frame=<n> --scale=0.5 --browser-executable=/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell` ile scratchpad'e al, Read ile incele, düzelt.
6. Ham render al, sonra `scripts/master_audio.sh <ham.mp4> out/video02-sinek.mp4` (hedef ~-14 LUFS, true peak -1 dBTP altı).
7. git commit YAPMA. `.claude/`, `strategy/` ve Video01 dosyalarına dokunma.

Rapor: süre, sahne zamanlama tablosu, değişen dosyalar, ses seviyesi, sapmalar, 4 temsilci kare (kanca, ayakla tat, tükürük şeması, kapak) ve MP4 yolu.
