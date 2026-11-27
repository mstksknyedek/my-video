# Görev: 3., 4. ve 5. videoların senaryoları

Ajan: `kanal-senarist`. Kurallar ajan tanımındadır; kesin uy: tek cümle testi (dosyanın başına "Bu video tek cümleyle: ..." yaz), ekranda da yazılan açık punchline, en fazla 8 sahne, 18-25 sn. Netlik her şeyden önce gelir (kanal sahibi ilk Nermin hikayesini anlamamıştı).

Videolar (`strategy/STRATEJI.md` §5):
- #3 "Annenin tupperi geri dönmeli": "Türk annesi" teması veride güçlü. Yeni karakter "Anne" gerekecek (özgün, SVG ile basit; animasyon notlarında tarif et). Sevecen mizah, aşağılama yok.
- #4 "Karınca olarak doğdun": "X olarak doğdun" biçimi veride çok güçlü bir sıra dışı başarıydı (kopyalamadan uyarla). Kazım (`src/kisacasi/karakterler/Kazim.tsx`) karınca olarak ilk gününü yaşasın ya da izleyici "karınca olarak doğsaydın" bakış açısıyla bir günü görsün. Böcek gerçeği varsa WebSearch ile doğrula, kaynağını yaz ("karınca 50 kat yük taşır" iddiası YANLIŞ, kullanma; ayrıntı `strategy/research/04-konular.md`).
- #5 "Düğünde takı muhasebesi": düğün teması veride çok güçlü. Takı töreninde "kim ne taktı" defteri; gerçek kişi/marka yok, altın fiyatı rakamı verme.

Konuşanlar: `voice/sesler.json`'daki karakterler (nermin-teyze, ugur-hoca, kazim, hamdi-bey, anlatici). Yeni ses gerekiyorsa "yeni ses gerekli: <tarif>" yaz; Genel Müdür seçecek.

Her video için iki dosya: `strategy/senaryolar/<NN>-<kisa-ad>.md` (önceki senaryolarla aynı biçim) ve `strategy/senaryolar/<NN>-<kisa-ad>-satirlar.json` (`[{"kim": "...", "metin": "...", "hiz": 1.1}]`, rakamlar yazıyla). NN: 05, 06, 07.

Rapor: her video için tek cümlelik özet ve punchline repliği.
