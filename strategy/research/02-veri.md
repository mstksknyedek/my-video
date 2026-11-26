# 02 — Veri: Türkçe Shorts'ta ne izleniyor?

*Kısacası (@kisacasitv) için gerçek YouTube verisiyle hazırlanan analiz. Veri toplama tarihi: 26 Kasım 2026.*
*Ham veri: `strategy/research/02-veri.csv` (1.584 satır).*

---

## 1. Yöntem ve veri kaynakları

| Adım | Ne yapıldı | İstek sayısı | Toplanan |
|---|---|---|---|
| Arama | YouTube aramasında **"Shorts" tür filtresiyle** 32 Türkçe sorgu, Türkçe arayüz (hl=tr, gl=TR), sorgu başına ilk sayfa | 32 | 1.134 sonuç (1.080 tekil video) |
| Video sayfası | Her sorgunun en çok izlenen 3 videosu + 1 medyan video için izleme sayfası verisi (kesin görüntülenme, beğeni, yükleme tarihi, kanal, abone, açıklama) | 125 | 125 video |
| Kanallar | 15 kanalın Shorts sekmesi (son 30 Short) + her kanalda en yeni ve 30. Short'un tarihi (paylaşım sıklığı için) | 45 | 450 Short, 30 tarih |

Toplam yaklaşık 220 istek (denemeler dahil), istekler arasında 1,5 sn+ bekleme. Hiçbir hesapla giriş yapılmadı.

### Toplanamayan veriler (dürüst not)
- **Süre (duration_s), etiketler (tags) ve yorum sayısı alınamadı.** YouTube, oturumsuz istemcilere oynatıcı verisini "bot olmadığınızı doğrulamak için oturum açın" uyarısıyla kapattı; yt-dlp de aynı hatayı verdi. Arama sonuçlarındaki Shorts kartları süre içermiyor. Bu yüzden CSV'de `duration_s` sütunu boş ve **raporda "süre tatlı noktası" ölçülemedi**. Bunu aşmak için giriş/çerez kullanmadık (görev "asla giriş yapma" diyordu).
- Arama kartlarındaki görüntülenme **yuvarlanmış** ("5,7 bin", "1,2 Mn"). 125 videoda kesin sayı izleme sayfasından alındı; CSV'de `views` = mümkünse kesin sayı, `views_rounded_from_search` = arama kartındaki sayı.
- Kanal adı yalnızca izleme sayfası çekilen 125 videoda ve kanal sekmelerindeki 450 Short'ta var; diğer arama satırlarında boş.

### Yanlılıklar (sonuçları okurken akılda tutun)
1. **Arama sıralaması yanlılığı:** YouTube "alaka" sırasına göre döndürüyor; popüler ve eski videolar öne çıkıyor. Sorgu medyanları "o konuda çekilen ortalama Short" değil, "o aramada üst sıralara çıkan Short"tur.
2. **Yaş yanlılığı:** Arama kartlarında yükleme tarihi yok. 125 videoluk örnekte eski videolar çok daha yüksek (aşağıdaki Tablo 8): ≤30 günlük videoların medyanı 47,2 B, >2 yıllıkların 6,22 Mn. Bazı temaların yüksek medyanı birikmiş evergreen videolardan geliyor.
3. **Küçük örnekler:** Sorgu başına 15–40 video; gün ve beğeni oranı analizleri 125 video üzerinde, tema başına 3–20 video. Bunlar **eğilim**, kesin kanıt değil.
4. **Dil:** Başlıkların %97'si Türkçe (basit kural: Türkçe karakter veya sık Türkçe kelime). Bazı sorgularda yabancı içerik de çıkıyor (ör. kedi videoları kısmen evrensel).

---

## 2. Hangi temalar izleniyor?

### Tablo 1 — Sorgu bazında görüntülenme (Shorts filtresi, ilk sayfa)

| Sorgu | Tema | n | TR başlık % | Medyan | %75'lik | En yüksek | >100 B oranı | Medyan (yalnız TR başlık) |
|---|---|---|---|---|---|---|---|---|
| kedi komik shorts | hayvan | 36 | 97 | 2,05 Mn | 6,80 Mn | 32,00 Mn | %86 | 1,90 Mn |
| türkçe animasyon shorts | animasyon-genel | 37 | 95 | 991 B | 3,10 Mn | 59,00 Mn | %65 | 656 B |
| çizgi film komik türkçe | animasyon-genel | 39 | 97 | 872 B | 7,70 Mn | 113,00 Mn | %67 | 700 B |
| düğün komik | gelenek | 40 | 100 | 272,5 B | 3,60 Mn | 19,00 Mn | %55 | 272,5 B |
| bilgi shorts türkçe | bilgi | 15 | 100 | 217 B | 943 B | 6,10 Mn | %53 | 217 B |
| komik seslendirme shorts | seslendirme | 33 | 91 | 203 B | 1,40 Mn | 26,00 Mn | %61 | 195,5 B |
| dublaj komik shorts | seslendirme | 37 | 95 | 197 B | 1,50 Mn | 15,00 Mn | %54 | 192 B |
| türk annesi komik | aile | 39 | 100 | 78 B | 825 B | 11,00 Mn | %46 | 78 B |
| sinek komik | böcek | 25 | 96 | 61 B | 137 B | 9,50 Mn | %36 | 65 B |
| bayram komik | gelenek | 38 | 100 | 56 B | 1,00 Mn | 21,00 Mn | %37 | 56 B |
| anne baba komik | aile | 25 | 96 | 56 B | 160 B | 8,90 Mn | %32 | 60,5 B |
| trafik komik | gündelik | 33 | 100 | 41 B | 572 B | 38,00 Mn | %39 | 41 B |
| animasyon mizah | animasyon-genel | 39 | 100 | 36 B | 232 B | 2,30 Mn | %36 | 36 B |
| komik animasyon shorts | animasyon-genel | 40 | 100 | 33,5 B | 202 B | 39,00 Mn | %42 | 33,5 B |
| gündem mizah shorts | gündem | 40 | 100 | 24,5 B | 56 B | 481 B | %8 | 24,5 B |
| böcek komik | böcek | 38 | 100 | 21 B | 259 B | 5,20 Mn | %34 | 21 B |
| öğrenci hayatı komik | okul | 40 | 100 | 19 B | 1,30 Mn | 26,00 Mn | %35 | 19 B |
| yapay zeka animasyon türkçe | yapay-zeka | 37 | 95 | 17 B | 76 B | 2,10 Mn | %19 | 3,8 B |
| ilginç bilgiler shorts | bilgi | 36 | 100 | 12,5 B | 165 B | 6,10 Mn | %33 | 12,5 B |
| hikaye animasyon türkçe | hikaye | 39 | 97 | 10 B | 316 B | 5,10 Mn | %36 | 9 B |
| karınca animasyon | böcek | 36 | 100 | 5,3 B | 38 B | 10,00 Mn | %22 | 5,3 B |
| kira komik | ekonomi | 36 | 100 | 4,5 B | 37 B | 3,00 Mn | %14 | 4,5 B |
| korku hikayesi animasyon | hikaye | 38 | 89 | 4,5 B | 45 B | 942 B | %21 | 6 B |
| asgari ücret komik | ekonomi | 36 | 100 | 4,4 B | 22 B | 425 B | %6 | 4,4 B |
| zam komik | ekonomi | 39 | 100 | 3,7 B | 17 B | 860 B | %23 | 3,7 B |
| futbol komik animasyon | futbol | 38 | 89 | 3,6 B | 100 B | 15,00 Mn | %24 | 3,6 B |
| köy komik animasyon | köy | 35 | 97 | 2,8 B | 39 B | 18,00 Mn | %17 | 2,3 B |
| okul komik animasyon | okul | 35 | 100 | 2,5 B | 55 B | 6,30 Mn | %17 | 2,5 B |
| ekonomi mizah animasyon | ekonomi | 37 | 95 | 1,4 B | 3,7 B | 81 B | %0 | 1,3 B |
| enflasyon mizah | ekonomi | 38 | 89 | 1,2 B | 2,7 B | 1,00 Mn | %3 | 1,1 B |
| tarih animasyon shorts | tarih | 35 | 100 | 1,2 B | 3,5 B | 3,80 Mn | %9 | 1,2 B |
| iş hayatı komik | iş-hayatı | 25 | 100 | 1,2 B | 3,0 B | 18 B | %0 | 1,2 B |

*B = bin, Mn = milyon.*

### Tablo 2 — Tema bazında (sorgular birleştirilmiş)

| Tema | n | Medyan | %75'lik |
|---|---|---|---|
| hayvan (kedi) | 36 | 2,05 Mn | 6,80 Mn |
| seslendirme / dublaj | 70 | 200 B | 1,50 Mn |
| animasyon-genel | 155 | 130 B | 1,20 Mn |
| gelenek (düğün, bayram) | 78 | 73,5 B | 2,00 Mn |
| aile (anne-baba) | 64 | 65 B | 546 B |
| gündelik (trafik) | 33 | 41 B | 572 B |
| gündem | 40 | 24,5 B | 56 B |
| bilgi | 51 | 18 B | 312 B |
| yapay zeka | 37 | 17 B | 76 B |
| böcek (karınca, sinek, böcek) | 99 | 12 B | 142 B |
| okul | 75 | 10 B | 116 B |
| hikaye (korku dahil) | 77 | 6,7 B | 160 B |
| futbol | 38 | 3,6 B | 100 B |
| köy | 35 | 2,8 B | 39 B |
| **ekonomi (kira, zam, enflasyon, asgari ücret)** | **186** | **2,5 B** | **12 B** |
| tarih | 35 | 1,2 B | 3,5 B |
| iş hayatı | 25 | 1,2 B | 3,0 B |

**Okuma:**
- **Evrensel, gündelik aile/gelenek durumları** (düğün, bayram, Türk annesi, anne-baba, trafik) ekonomi temalarından 15–100 kat daha yüksek medyana sahip.
- **Ekonomi mizahı (kira, zam, enflasyon, asgari ücret) en zayıf grup:** 186 videoda medyan 2,5 B, "enflasyon mizah" ve "ekonomi mizah animasyon"da 100 B'yi geçen video oranı %0–3. Bu temada çok sayıda içerik var ama izlenme düşük; yani arz bol, talep zayıf. İstisna, bilinen bir marka (Çok Güzel Hareketler, 6 Mn abone) — "Asgari Ücret Nedir Bilir Misin?" 425 B.
- **Seslendirme/dublaj** (mevcut görüntüye komik Türkçe ses) Türkçeye özgü en güçlü biçimlerden biri: medyan ~200 B.
- **Böcek** temasında medyan düşük (12 B) ama tavan yüksek: "sinek komik" medyan 61 B, en yüksek 9,5 Mn; "karınca animasyon" en yüksek 10 Mn. Yani tutarsız ama patlama potansiyeli var (bkz. Tablo 5).

---

## 3. Kanal büyüklüğüne göre aykırı başarılar (iyi fikir sinyali)

125 videoluk örnekte (abone ≥1.000 olan 100 video) **görüntülenme/abone oranının medyanı 18,7x**.

### Tablo 3 — Abonesine göre en çok aşan Shorts (ilk 20)

| Başlık (kısaltılmış) | Kanal | Abone | Görüntülenme | Oran | Yükleme | Tema |
|---|---|---|---|---|---|---|
| Kedi Videoları #komik #kedi … | YELİZ FİLİZ | 6,5 B | 13,29 Mn | 2052x | 2022-03-12 | hayvan |
| Rafadan Tayfa komik Montaj … | HiperMahmut | 6,6 B | 12,78 Mn | 1949x | 2023-03-07 | animasyon |
| Neden dua eden bir peygamber devesine su döküyor? \| İLGİNÇ BİLGİLER #5 | KnowLedgeFact | 1,7 B | 2,34 Mn | 1369x | 2025-10-13 | bilgi (böcek) |
| Pick me girl😎 … | ~ AZRA ~ | 37,1 B | 26,37 Mn | 711x | 2024-01-19 | okul |
| tayfun yılmaz | Early | 56,5 B | 39,23 Mn | 694x | 2020-06-09 | animasyon |
| divayım ben #hamamböceği #yapayzeka | böcek videos | 1,5 B | 957,9 B | 630x | 2026-09-02 | böcek |
| Bu Oyuncu Kediye Dikkat! ⚡😼 … | MiyavBu | 42,6 B | 25,91 Mn | 608x | 2025-08-02 | hayvan |
| Japon Okul Tuvaletinin Lanetli Son Kabini 🚽👻 | Absürt Hikayeler | 1,2 B | 733 B | 591x | 2026-11-14 | hikaye |
| Futbol Topu Aslında Küptü! ⚽🎲 | Arca Studio0 | 2,8 B | 1,46 Mn | 518x | 2026-11-21 | futbol |
| komik kedi videoları!!! … | Şura Mirza Tv | 66 B | 32,10 Mn | 486x | 2023-05-12 | hayvan |
| O tabakla işim bitmemişti #shorts #animasyon | Kaganimator | 10,2 B | 4,84 Mn | 475x | 2024-12-22 | animasyon |
| Sonic ve Tails komik animasyon Türkçe Dublaj! … | Chao Dublaj | 2,9 B | 872,5 B | 297x | 2024-11-01 | animasyon/dublaj |
| Bayramın İlk Günü Planlaması \| Önce Kime Gidilecek? … | Dinlenme Tesisi Shorts | 58,6 B | 13,08 Mn | 223x | 2025-06-05 | gelenek |
| sevimli köpek gülpembe eve inek getiriyor … | BICIRIX | 11,6 B | 2,14 Mn | 184x | 2025-09-25 | animasyon |
| Herkesin Rüyasına Giren Adam - Korku Animasyonu … | Korku Keşfi | 5,6 B | 942,5 B | 168x | 2026-06-12 | hikaye |
| Bakkal Amca 👴 … | Tombik Panda | 541 B | 59,93 Mn | 111x | 2025-12-10 | animasyon (çocuk) |
| Uzayda Ağlarsan Ne Olur? \| İlginç Gerçekler! | Bunu Biliyor Muydun? | 45,7 B | 4,85 Mn | 106x | 2025-05-13 | bilgi |
| "GÖREV ATAMASI" #shorts #gündem #mizah … | GURONİ OFFİCİAL | 4,6 B | 481,5 B | 104x | 2026-06-16 | gündem |
| Uzaylılar Neden Hep Yeşil Gösterilir? 👽🌍 | GereksizBilgiler | 2,4 B | 217,2 B | 89x | 2025-09-27 | bilgi |
| Asansör düşmesinden nasıl kaçarsın? … | Atakan … | 73,7 B | 6,17 Mn | 84x | 2024-07-04 | bilgi |

### Tablo 4 — Son 6 ayın (2026-05-26 sonrası) dikkat çeken Shorts'ları, küçük kanallardan

| Yükleme | Görüntülenme | Abone | Kanal | Başlık |
|---|---|---|---|---|
| 2026-11-21 | 1,46 Mn | 2,8 B | Arca Studio0 | Futbol Topu Aslında Küptü! ⚽🎲 |
| 2026-09-02 | 958 B | 1,5 B | böcek videos | divayım ben #hamamböceği #yapayzeka |
| 2026-06-12 | 942 B | 5,6 B | Korku Keşfi | Herkesin Rüyasına Giren Adam - Korku Animasyonu |
| 2026-11-22 | 755 B | 15,9 B | Dili Olsa da Söylese | Okul Kapısı Olarak Doğdun 🏫 \| "Zil çalmadan kimse çıkmıyor!" |
| 2026-11-14 | 733 B | 1,2 B | Absürt Hikayeler | Japon Okul Tuvaletinin Lanetli Son Kabini 🚽👻 |
| 2026-11-22 | 612 B | 15,9 B | Dili Olsa da Söylese | Tahta Kalemi Olarak Doğdun 🖊️ \| "Bu kalem yazmıyor!" |
| 2026-06-16 | 481 B | 4,6 B | GURONİ OFFİCİAL | "GÖREV ATAMASI" (gündem mizahı) |
| 2026-10-30 | 202 B | 670 | Bilgin Küre | Almanya Birinci Dünya Savaşı'nı Kazansaydı Harita Nasıl Olurdu? |
| 2026-11-25 | 118 B | 5,7 B | Gurme Mizah | Riskli soruda D'yi işaretleyip kaderine razı olan öğrenci 😂✍️ |

**Çıkan desen:** Küçük kanalların patlayan Shorts'ları (1) **cansız bir nesneye/hayvana/böceğe ses veren** ("X Olarak Doğdun", konuşan hamamböceği "divayım ben", futbol topu), (2) **absürt bir önerme** ("Futbol topu aslında küptü", "lanetli son kabin"), (3) **herkesin yaşadığı okul/aile anı** içeriyor. Neredeyse hiçbiri ekonomi/zam konulu değil.

---

## 4. Öğrenilecek kanallar (animasyon / çizim / seslendirme mizahı)

Medyan = kanalın Shorts sekmesindeki son 30 Short'un medyanı (en yeni videolar da dahil, bu yüzden hafif aşağı yanlı). Sıklık = en yeni ve 30. Short arasındaki gün farkından. Beğeni oranı = iki örnek Short'tan.

### Tablo 5 — Kanal profilleri

| Kanal | Tür | Abone | Son 30 Short medyanı | Son 30'da en yüksek | Medyan/abone | Paylaşım sıklığı | Başlık uzunluğu (medyan karakter) | Başlık stili | Beğeni/izlenme (2 örnek) |
|---|---|---|---|---|---|---|---|---|---|
| **Dili Olsa da Söylese** (@DiliOlsadaSöylese) | konuşan nesneler animasyonu | 15,9 B | **328 B** | 3,10 Mn | **%2063** | 21/hafta (16–26 Kas) | 52 | "X Olarak Doğdun 🏫 \| "replik"", emoji %100, soru %40, hashtag yok | %0,4, %0,4 |
| **Kaganimator** (@Kaganimator) | tek kişilik Türkçe animasyon skeç | 10,2 B | 44,5 B | 160 B | %436 | 2,3/hafta (son Short 2025-04-20, aktif değil) | 43,5 | argo replik başlık ("Yürü Git Lan Düdük!"), #shorts #animasyon | %1,5, %2,1 |
| **Feromen** | parodi skeç (canlı) | 295 B | 826,5 B | 14,00 Mn | %280 | 4,6/hafta | 64 | BÜYÜK HARF + 😂 + 4 hashtag ("DÜĞÜNDE KENDİNİ KAYBEDEN ERKEK 🤣") | %0,5, %0,4 |
| **Dublaj Kasabası** (@dublajkasabası) | komik Türkçe seslendirme | 561 B | **1,30 Mn** | 3,80 Mn | %232 | 14/hafta | **19** | kısa: "ANAHTAR KELİME + 2 kelime! 😂😀", emoji %100, hashtag yok | %1,3, %1,1 |
| **DiloToon** (@DiloToon) | hayvan belgeseli + anlatım/animasyon | 68,5 B | 95 B | 1,00 Mn | %139 | 11,7/hafta | 58,5 | soru ("Aslan kazarak ne bulacak?"), #trendingshorts | %2,8, %1,0 |
| **Ne Olurdu?** (@NeOlurdu) | alternatif tarih / harita | 222 B | 165 B | 364 B | %74 | 6,6/hafta | 50 | %100 soru ("…Olsaydı?") | %3,1, %1,7 |
| **Bunu Biliyor Muydun?** | bilgi/anlatım | 45,7 B | 34 B | 874 B | %74 | 3,6/hafta | 49 | soru + emoji (%83) | %0,6, %0,5 |
| **Hikâye Arenası** | sinema bilgisi/anlatım | 170 B | 94,5 B | 896 B | %56 | 5,8/hafta | 56 | soru %23 | %1,3, %0,7 |
| **Tarihsel Bypass** | film/hikâye anlatımı | 413 B | 218 B | 10,00 Mn | %53 | 3/hafta (son Short 2026-05-23) | 56,5 | dramatik cümle, emoji yok | %2,8, %2,5 |
| **Fikri Kereviz** (@FikriKereviz) | **Türkçe gündelik hayat animasyonu (okul, çocukluk)** | 2,23 Mn | **999,5 B** | 5,50 Mn | %45 | 5,1/hafta | 35,5 | sade durum cümlesi, emoji/hashtag yok ("Okulda Ağladığımda", "Küçükken Bisiklet Sürdüğümüzde") | %1,9, %1,2 |
| **Erdem** (@erdemdublaj) | komik dublaj | 1,17 Mn | 448,5 B | 5,20 Mn | %38 | 7,2/hafta | 28,5 | kısa yorum cümlesi, hashtag yok | %1,9, %4,1 |
| **Pırtık** (@Prtk) | çocuk animasyonu (eğitici) | 4,02 Mn | 607,5 B | 13,00 Mn | %15 | 1,8/hafta | 63,5 | açıklayıcı + #learncolors | %0,6, %0,5 |
| **DKomedi** (@dkomedi) | aile skeçleri (canlı) | 486 B | 57 B | 1,50 Mn | %12 | 3,3/hafta | 51 | BÜYÜK HARF + 💀/👀 + 5 hashtag | %2,0, %1,2 |
| **Komik Yorumlar TR** | derleme | 938 B | 60 B | 1,20 Mn | %6 | ~70/hafta | 29 | durum + 2 emoji | – |
| **Sesli Köşe** | alıntı seslendirme (mizah değil) | 166 B | 4,9 B | 7,7 B | %3 | 7,5/hafta | 94,5 | uzun alıntı | %9,6, %11,1 |

**Not:** Sıklık ve medyan yüksek olsa bile çok sık paylaşan derleme kanalı (Komik Yorumlar TR, ~70/hafta) abonesine göre en düşük oranlardan birinde (%6). Hacim tek başına yetmiyor.

---

## 5. Başlık kalıpları

Yöntem: 1.054 tekil Türkçe başlıklı arama sonucu. Tema etkisini ayırmak için her videonun **kendi sorgusu içindeki sıralama yüzdeliği** (0 = sorgunun en az izleneni, 1 = en çok izleneni) kullanıldı; 0,50 nötr.

### Tablo 6 — Başlık özellikleri

| Özellik | Var (n) | Sorgu-içi yüzdelik (var) | Medyan izlenme (var) | Yok (n) | Yüzdelik (yok) | Medyan (yok) |
|---|---|---|---|---|---|---|
| Soru işareti | 118 | 0,52 | 17,5 B | 936 | 0,49 | 15 B |
| Rakam içeriyor | 172 | **0,36** | 2,8 B | 882 | 0,51 | 20 B |
| "POV" | 1 | – | – | 1053 | – | – |
| Emoji | 513 | 0,47 | 19 B | 541 | 0,50 | 12 B |
| BÜYÜK HARF (harflerin >%60'ı) | 105 | **0,63** | 44 B | 949 | 0,47 | 12 B |
| #shorts etiketi | 368 | 0,44 | 16 B | 686 | 0,51 | 16 B |

| Başlıktaki hashtag sayısı | n | Yüzdelik | Medyan |
|---|---|---|---|
| 0 | 290 | **0,55** | 33 B |
| 1–2 | 212 | 0,47 | 16 B |
| 3–5 | 336 | 0,42 | 9,2 B |
| 6+ | 216 | 0,50 | 10,4 B |

| Toplam başlık uzunluğu (karakter, hashtag dahil) | n | Yüzdelik | Medyan |
|---|---|---|---|
| ≤30 | 77 | **0,66** | 124 B |
| 31–50 | 202 | 0,50 | 21 B |
| 51–70 | 289 | 0,50 | 24 B |
| 71–100 | 486 | 0,46 | 7,8 B |

| Hashtag hariç metin uzunluğu | n | Yüzdelik | Medyan |
|---|---|---|---|
| ≤25 | 276 | 0,54 | 17 B |
| 26–40 | 322 | 0,49 | 22,5 B |
| 41–60 | 316 | 0,45 | 11,5 B |
| >60 | 140 | 0,43 | 6,8 B |

**Okuma:**
- **Kısa başlık kazanıyor:** ≤30 karakterlik başlıklar sorgu içinde en üst bölgede (0,66). Uzadıkça yüzdelik düşüyor. Başarılı kanallarda da aynı: Dublaj Kasabası medyan 19 karakter, Erdem 28,5, Fikri Kereviz 35,5.
- **Hashtag yığını işe yaramıyor:** Başlıkta hiç hashtag olmayanlar (0,55) 3–5 hashtag'lilerden (0,42) iyi. En başarılı animasyon/dublaj kanallarının üçü (Fikri Kereviz, Dublaj Kasabası, Erdem) başlıkta hashtag kullanmıyor.
- **Rakam kötü sinyal** (0,36): örneklerde rakamlar çoğunlukla "Part 7", "1. bölüm", yıl ve liste numarası, yani seri/bölüm hissi veriyor.
- **BÜYÜK HARF iyi görünüyor** (0,63, n=105), ama bu kısmen Feromen gibi büyük kanallardan geliyor; nedensellik iddia edilemez.
- Soru işareti ve emoji nötre yakın; "POV" Türkçe Shorts'ta neredeyse hiç kullanılmıyor (1.054'te 1).

### Tablo 7 — En sık hashtag'ler (başlıklarda)

| Tüm Türkçe başlıklar (n=1.054) | Kendi sorgusunun üst %25'indekiler (n=268) |
|---|---|
| #shorts 364 | #shorts 87 |
| #komik 259 | #komik 55 |
| #komedi 165 | #komedi 40 |
| #animasyon 156 | #mizah 33 |
| #mizah 151 | #keşfet 28 |
| #keşfet 119 | #animasyon 26 |
| #funny 47 | #funny 11 |
| #komikvideolar 46 | #viral 11 |
| #animation 41 | #komikvideolar 10 |
| #eğlence 33 | #yapayzeka 9 |
| #çizgifilm 29 | #animation 8 |
| #viral 29 | #trending 8 |

Hashtag listesi üst çeyrekte ve tümünde neredeyse aynı: **hashtag seçimi fark yaratan bir değişken değil**; temel etiketler (#komik #mizah #animasyon) yeterli.

---

## 6. Etkileşim, yaş ve gün

### Beğeni / görüntülenme (125 video)
- Medyan **%0,73** (alt çeyrek %0,46, üst çeyrek %1,29).
- Temalara göre medyan (n küçük): tarih %1,8 (4), hikaye %1,1 (8), seslendirme %1,1 (6), ekonomi %1,0 (20), böcek %0,8 (12), aile %0,8 (7), gelenek %0,6 (8), animasyon-genel %0,5 (17), kedi %0,5 (4).
- Çok izlenen videolarda beğeni oranı düşüyor (viral dağıtım = pasif izleyici). Ekonomi videoları az izleniyor ama izleyeni beğeniyor; niş ama sadık kitle.

### Tablo 8 — Yaşa göre görüntülenme (125 video)

| Video yaşı | n | Medyan |
|---|---|---|
| ≤30 gün | 17 | 47,2 B |
| 31–180 gün | 22 | 712 B |
| 181–365 gün | 15 | 860,8 B |
| 1–2 yıl | 37 | 2,14 Mn |
| >2 yıl | 34 | 6,22 Mn |

Shorts uzun süre izlenmeye devam ediyor; evergreen (zamansız) konular yıllarca birikim yapıyor. Gündeme bağlı içeriğin bu birikimi yapma şansı daha az.

### Tablo 9 — Yükleme günü (125 video, sadece bilgi amaçlı)

| Gün | n | Medyan |
|---|---|---|
| Pazartesi | 17 | 2,34 Mn |
| Salı | 21 | 700,7 B |
| Çarşamba | 18 | 1,18 Mn |
| Perşembe | 21 | 3,02 Mn |
| Cuma | 14 | 907,5 B |
| Cumartesi | 17 | 1,46 Mn |
| Pazar | 17 | 401,2 B |

Gün başına 14–21 video; farklar birkaç eski viral videonun etkisiyle oluşuyor ve yaş kontrol edilmedi. **Yükleme günüyle ilgili güvenilir bir sonuç yok.** Gün seçimi yerine düzenlilik önemli.

### Süre
**Ölçülemedi** (bkz. Bölüm 1). Süre için ilk 2–3 ay kendi YouTube Studio verilerimizle test yapılmalı.

---

## Kanal için çıkarımlar

1. **Ekonomi/zam/kira mizahını ana tema yapmayın.** 186 videoda medyan 2,5 B; "enflasyon mizah" ve "ekonomi mizah animasyon"da 100 B'yi geçen video oranı %0–3. Gündemi işleyecekseniz evrensel bir aile/okul anının içine yerleştirin ("annem markette fiyat görünce"). Bu bir çıkarımdır, ölçülmemiştir; ölçülen, saf ekonomi başlıklarının zayıflığıdır.
2. **Ana temalar: gelenek + aile + okul + gündelik durumlar.** Düğün (medyan 272,5 B), bayram (56 B, %75'lik 1 Mn), Türk annesi (78 B), anne-baba (56 B), trafik (41 B). En büyük Türkçe animasyon kanalı Fikri Kereviz (2,23 Mn abone, son 30 Short medyanı ~1 Mn) tamamen bu alanda: "Okulda Ağladığımda", "Küçükken Bisiklet Sürdüğümüzde".
3. **Böcek videoları için "konuşan böcek / böcek olarak doğdun" formatını deneyin.** Böcek temasının medyanı düşük (12 B) ama tavanı yüksek: konuşan yapay zeka hamamböceği "divayım ben" 1,5 B abonelik kanalda 958 B; "sinek komik" en yüksek 9,5 Mn; "karınca animasyon" en yüksek 10 Mn. En güçlü kanıt "Dili Olsa da Söylese": 15,9 B abone, son 30 Short medyanı 328 B (abonesinin %2063'ü), "X Olarak Doğdun 🏫 | "replik"" formatı. Kısacası için doğrudan uyarlanabilir bir seri: "Karınca Olarak Doğdun", "Sivrisinek Olarak Doğdun", "Kira Kontratı Olarak Doğdun".
4. **Seslendirme ve dublaj tonu kullanın.** "Komik seslendirme" ve "dublaj komik" medyanı ~200 B; Dublaj Kasabası son 30 Short medyanı 1,30 Mn (abonesinin %232'si). Karakterlere güçlü, tanıdık Türkçe replikler yazın; Kaganimator'ın argo-replik başlıkları ("Yürü Git Lan Düdük!") 10 B abonede 44,5 B medyan getirdi.
5. **Başlıkları kısa tutun:** hedef ≤30–35 karakter, tek durum veya tek replik. ≤30 karakterlik başlıklar sorgu içinde 0,66 yüzdelikte, 71–100 karakterlikler 0,46'da. Kalıplar: "ANAHTAR KELİME + kısa durum! 😂" (Dublaj Kasabası), "…dığımızda / …dığımda" (Fikri Kereviz), "X Olarak Doğdun 🐜 | "replik"".
6. **Hashtag'i başlığa yığmayın.** Başlıkta 0 hashtag 0,55, 3–5 hashtag 0,42. Gerekirse açıklamaya 2–3 temel etiket yeterli: #komik #mizah #animasyon (en sık ve üst çeyrekte de en sık olanlar). #shorts eklemenin ölçülebilir faydası yok (0,44'e karşı 0,51). Rakam/"Part 7" gibi bölüm numaralarından kaçının (0,36).
7. **Evergreen konulara odaklanın.** 2 yaşın üzerindeki videoların medyanı 6,22 Mn, son 30 gündekilerin 47,2 B. Bayram, düğün, okul ilk günü, karne, yılbaşı gibi her yıl dönen anlar yıllarca izlenebilir; takvime göre planlayın (bayram ve düğün sezonundan 1–2 hafta önce).
8. **Haftada 3–7 Short ile düzenli paylaşın.** Başarılı animasyon ve dublaj kanalları haftada 5–14 paylaşıyor (Fikri Kereviz 5,1, Erdem 7,2, Dublaj Kasabası 14). Ancak hacim tek başına yetmiyor (Komik Yorumlar TR ~70/hafta, abonesinin %6'sı). Gün seçimi için veri anlamlı değil.
9. **Örnek alınacak kanallar:**
   - **Fikri Kereviz** (format ve evergreen konu seçimi),
   - **Dili Olsa da Söylese** (küçük kanaldan patlayan seri formatı),
   - **Dublaj Kasabası** ve **Erdem** (ses mizahı ve kısa başlık),
   - **Kaganimator** (tek kişilik Türkçe animasyon skeç; 2025-04'ten beri aktif değil, boşluk olabilir),
   - **Arca Studio0** ve **Absürt Hikayeler** (absürt önerme, küçük kanalda 700 B+).
10. **İlk 90 günde kendi verimizle doğrulayın:** süre (15–30 sn ve 30–60 sn karşılaştırması), seri ve tekil Short farkı, kısa ve uzun başlık. Bu raporda süre ve yorum verisi alınamadığı için bunlar en önemli eksikler.
