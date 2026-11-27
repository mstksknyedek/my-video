# Görev: Video 7 "Düğünde takı muhasebesi" montajı

Ajan türü: general-purpose.

Proje: /home/user/my-video (Remotion). Önce CLAUDE.md'yi, sonra `.claude/skills/remotion-best-practices/SKILL.md` ve onun remotion-markup, remotion-interactivity, remotion-captions rehberlerini oku.

Genel kurallar
- Senaryonun ÜSTÜNDEKİ "Genel Müdür notları" kural denetiminden gelen ZORUNLU düzeltmelerdir; sahne tablosuyla çelişirse notlar kazanır.
- Netlik: espri bir bakışta okunmalı; punchline hem söylenir hem büyük yazıyla ekranda kalır (≥1,5 sn).
- Seslendirme HAZIR, yeniden üretme: `public/voice/<klasör>/NN-<kim>.mp3` + `zamanlama.json` (baştaki sessizlik kırpılmış; her Audio satır başlangıcında başlar, trimBefore yok).
- Referans biten videolar (aynı stil, aynı yapı): `src/kisacasi/videolar/Video02Sinek.tsx` (en yenisi) ve `Video01SesliMesaj.tsx`: Track yapısı, ShortsCaptions (inline dizi, `beklemeMs`, `birlestirmeMs`), kapak karesi, döngü, LogoBadge, güvenli alan (x 80-940, y 100-1450; altyazı ve kaynak satırı y≤1450).
- Bileşenler: `src/kisacasi/karakterler/` (Kazim, NerminTeyze, UgurHoca, Sinek, animasyon.ts, Agiz.tsx), `ShortsCaptions.tsx`, `LogoBadge.tsx`, `PaperBackground.tsx`, `MesajEkrani.tsx`, `fonts.ts`. Mevcut bileşenlerin davranışını bozma (yeni prop ekleyeceksen isteğe bağlı olsun).
- Ses efektleri `public/sfx/` (kaynaklar `public/sfx/KAYNAKLAR.md`). Yenisi gerekirse earshot ile üret (`earshot make "<english>" -o sounds/generated/<ad>.wav`), `public/sfx/`'e kopyala, KAYNAKLAR.md earshot satırına ekle, `python3 scripts/setup_sounds.py` çalıştır.
- Şablon çeşitliliği: art arda çıkan üç videonun iskeleti benzemesin; bu videoda aşağıda belirtilen ayırt edici görsel aracı mutlaka kullan.
- `src/Root.tsx`'te `<Folder name="Kisacasi">` içine Composition kaydet (literal durationInFrames).
- Doğrula: `npx tsc --noEmit`, `npx eslint src` temiz. Her sahnenin karesini `npx remotion still <id> <dosya> --frame=<n> --scale=0.5 --browser-executable=/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell` ile scratchpad'e (/tmp/claude-0/-home-user-my-video/d39c80bb-173c-5664-b056-862f269c89f4/scratchpad/<video>/) al, Read ile incele, sorunları düzelt.
- Ham render al, sonra `scripts/master_audio.sh <ham.mp4> out/<dosya>.mp4` (hedef ~-14 LUFS, true peak -1 dBTP altı).
- git commit YAPMA. `.claude/`, `strategy/` ve diğer videoların dosyalarına dokunma.

Rapor: süre, sahne zamanlama tablosu, değişen/eklenen dosyalar, ses seviyesi, sapmalar ve nedenleri, 4 temsilci kare (kanca, ana espri, punchline, kapak) ve MP4 yolu.

## Bu videoya özel
- Senaryo: `strategy/senaryolar/07-dugun-taki-defteri.md`; ses: `public/voice/07-dugun/`; Composition id `Video07DugunTakiDefteri`; çıktı `out/video07-dugun.mp4`.
- Karakter: `NerminTeyze.tsx`; senaryonun istediği telefonsuz/defterli poz için isteğe bağlı yeni bir `elinde` prop'u ekleyebilirsin (varsayılan davranış değişmesin). Sahne 4'te "hesap yapan" ifade (gözler kısık, parmakla sayma; kaşlar çatık DEĞİL): `sinirli` KULLANMA.
- Ayırt edici görsel araç: kurdeleli takı noktası (gelin-damat yalnızca arkadan silüet, yüz yok) ve sahne 6'daki "kamera salona döner, 40 defter birden açılır" ters dönüşü, whip-pan geçişi.
- Zorunlu: konuk silüetleri kadın/erkek ve yaş karışık; Kenan Amca sahne 6'da küçük bir cep defteri çıkarır; ekran yazısı `SEVİM: KAYDEDİLDİ`.
- Çeyrek altın çiziminde portre, tuğra, kenar yazısı ÇİZME: düz sarı yuvarlak; bilezik de desensiz. Altın fiyatı, gram, yatırım yok. Marka yok.
