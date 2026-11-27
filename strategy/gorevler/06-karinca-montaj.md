# Görev: Video 6 "Karınca olarak doğdun" montajı

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
- Senaryo: `strategy/senaryolar/06-karinca-olarak-dogdun.md`; ses: `public/voice/06-karinca/`; Composition id `Video06KarincaDogdun`; çıktı `out/video06-karinca.mp4`.
- Karakter: `Kazim.tsx` (mevcut). Anlatıcı (Orus) kısa ve kuru konuşur.
- Ayırt edici görsel araç: yuva tüneli kesiti + dev çalar saat/kum saati + uyku sayacı rozeti (`UYKU: 0/250`, sahne 2'den itibaren artar); Kazım'ın her uykusu 1 dakikalık kum saati ile gösterilir. Kaynak satırı (Cassill ve ark. 2009) y≈1300'de, güvenli alanda.
- Punchline ekranda: "ATEŞ KARINCASI OLSAN 'BEŞ DAKİKA DAHA' YOK." (sarı blok, iki satır).
- Çizim gerektirenler: yuva tüneli arka planı, çalar saat, kum saati, sayaç rozeti (Kazım zaten var).
