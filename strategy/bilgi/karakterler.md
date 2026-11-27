# Karakter rehberi

Sahibi: kanal-karakter-animasyon. Eski bulgular silinmez; yanlış çıkan "geçersiz" diye işaretlenir.
Kaynaklar: `strategy/research/04-konular.md` §1.2 (karakter tarifleri), `strategy/STRATEJI.md` §3,
`strategy/senaryolar/01-ev-arkadasi-araniyor.md` (ses yönü, Hamdi Bey'in görünüşü).

---

## Ortak çizim kuralları (2026-11-26)

- **Kontur:** #111111, ana şekillerde 8 px (600x600 viewBox'ta), detayda 4-7 px. Uçlar ve köşeler yuvarlak.
- **Renk:** düz renk, degrade yok. Tek parlama: beyaz eğri çizgi, opaklık 0,3-0,45.
- **Palet:** kırmızı #E51C0F, sarı #F7C600 / koyu sarı #D9A400, mavi #1E3FAE, krem #F3EBDD, mürekkep #111111,
  ağız içi #6E0B05, dil #FF7A6B, gözyaşı #7CC7F2. Sabitler: `src/kisacasi/karakterler/animasyon.ts`.
- **Göz:** beyaz daire + siyah bebek + (Kazım'da) küçük beyaz parıltı. Göz kırpma her ~3,4 sn, 7 kare;
  her 3. döngüde çift kırpma. Aynı karede iki karakter varsa `kirpmaGecikmesi` farklı verilir.
- **Nefes (idle):** 2,6 sn'lik döngü; gövde dikeyde %1,6-1,8, yatayda %0,8 büyür, kafa 2,5-3 px kalkar.
- **Konuşma:** iki sinüsün karışımı (3,1 Hz + 1,3 Hz), ağız 0-1 arası açılır; açıklık 0,35'i geçince dil görünür.
  Konuşurken kafa 2-3 derece sallanır. Gerçek dudak senkronu (ses dosyasından) sonraki adım.
- **4 ifade** (`ifade` prop'u): kaşın açısı + ağzın eğrisi + bebek konumu + tek bir "işaret" ile okunur:
  | ifade | kaş | ağız | bebek | işaret |
  |---|---|---|---|---|
  | mutlu | yumuşak kavis | gülümseme (eğri +) | ileri bakar | Kazım'da pembe yanak |
  | saskin | 14-16 px yukarı, kavis | yuvarlak "O" | küçülür | gözler %14-18 büyür, kafada 3 şok çizgisi |
  | sinirli | iç uçlar aşağı | düz/hafif ters, dar | ileri | kafada öfke işareti (4 kavis) |
  | uzgun | iç uçlar yukarı | ters kavis | aşağı bakar | akan gözyaşı (1,6 sn döngü), antenler düşer |
- **Yön:** `yon="sol"` ile ayna. Diyalogda iki karakter birbirine bakar.
- **Ölçek:** her karakter 600x600 viewBox, ayaklar y=540'ta. `size` px genişliktir; aynı `size` = aynı zemin
  çizgisi, sahneye koyarken hizalama kolay. Küçük boyutta (200 px) ifadeler hâlâ okunuyor (önizlemede denendi).
- **Özgünlük:** böcekler gerçek anatomiden basitleştirildi (karınca 3 daire, uğur böceği yarım kubbe);
  bilinen bir çizgi film karakterinin yüzü, kıyafeti, renk düzeni kopyalanmadı.

## Kazım (Kiracı Karınca) — çizildi: `src/kisacasi/karakterler/Kazim.tsx`

- **Görünüş:** üç kırmızı daire. Oranlar (viewBox): kafa r=98, karın r=82, göğüs r=46; kafa gövdenin en büyük
  parçası (sevimlilik). Altı siyah bacak, hepsi göğüsten çıkar (gerçek karınca gibi).
- **Antenler:** biri düz ve yuvarlak uçlu; öbürü **hep bükük**: yukarı çıkıp keskin bir dirsekle öne-aşağı kıvrılır.
  Bu kanalın tanıma işareti; hiçbir sahnede düzeltilmez.
- **Sırt çantası:** kendinden büyük sarı çanta (230x250), koyu sarı kapak, mavi toka, kesik dikişli ön cep,
  üstte bağlı mavi rulo şilte, yanda sallanan **ev anahtarı** (kiracı şakası). Omuz askısı göğsün önünden geçer.
- **Hareket:** `yuruyor` = tripod yürüyüş (3 bacak yerde, 3 havada), 1,7 döngü/sn, gövde 8 px zıplar, çanta
  ±2,5 derece, anahtar ±16 derece sallanır. Durunca çanta nefesle hafifçe oynar.
- **Kişilik ve ses tonu:** genç erkek, hafif yorgun ama iyimser, hızlı konuşur (senaryo 01 ses yönü).
  Dertlerini kendi kendine söylenerek değil, izleyiciye açıklayarak anlatır. İmza: "Kısacası… taşınıyoruz."
  ve çantasını tek hamlede toplar.
- **Tipik pozlar:** ilan asarken zıplama, çantayı sırtlayıp yürüme, bükük antenin yavaşça düşmesi (hayal kırıklığı).

## Uğur Hoca — çizildi: `src/kisacasi/karakterler/UgurHoca.tsx`

- **Görünüş:** kırmızı yarım kubbe kabuk (R=180) + 6 siyah nokta, kabuğun altında siyah karın bandı, siyah
  yuvarlak kafa (r=102) kabuğun ön kenarının altından çıkar. Kısa topuz uçlu iki anten.
- **Öğretmen işaretleri:** altın telli **küçük yuvarlak gözlük** (açık mavi cam), **beyaz gür kaşlar** ve
  **beyaz bıyık** (siyah kafada ifadeyi taşıyan şey bunlar), mavi papyon, ön ayakta **tebeşir**.
- **Hareket:** `tebesirSalliyor` = kol omuzdan ±16 derece, 2,3 Hz sallanır; tebeşir ucundan 3 toz bulutu çıkar.
  Bıyık gülünce/konuşunca kalkar, üzülünce düşer; şaşırınca gözlük 8 px zıplar.
- **Kişilik ve ses tonu:** emekliliği yaklaşmış, sevecen ama titiz bir öğretmen. Orta-ileri yaş, net diksiyon,
  cümle sonunda kısa duraklama ("Bugünkü dersimiz…"). Bilgiyi ciddi verir, benzetmede göz kırpar.
  İmza: "Kısacası millet… [özet]. Ders bitti!" (26.11.2026 kural denetimi kararı: "çocuklar" hitabı kullanılmaz; sınıfta bir an yetişkin böcekler görünür, tahtada "Akşam Kursu") + zil. Ekranda her bölüm "Kaynak: …" yazısı.

## Hamdi Bey (ev sahibi hamamböceği) — rehber notu, çizim sonra

- Senaryo 01'e göre: takım yelek, elinde ajanda, sakin gülümseyen yüz, eğilerek içeri bakar.
- Öneri: koyu kahverengi (#7A4A1E altyazı vurgusuyla uyumlu) uzun oval gövde, iki çok uzun anten (sahneye
  ondan önce girer), yeleğin cebinde saat zinciri. Kazım'dan 1,5-2 kat büyük; kapıdan "eğilerek" bakması
  bu oranla komik olur. Hep yarı kapalı, kendinden emin gözler; ifade değişimi az (dayanıklılık şakası).
- Ses: orta yaş erkek, tok, yavaş, aşırı kibar ("kardeşim"i uzatır). Gerçek bir kişinin sesi klonlanmaz.
- Gereken parçalar: `ajandaAcik`, kapıdan eğilme pozu, kafasız şaka için kafa ayrı katman.

## Nermin Teyze — rehber notu (2026-11-26, ilk not; çizildi, aşağıya bakın)

- 04-konular §1.2: yuvarlak yüz, topuz saç, kalın çerçeveli gözlük, mavi hırka, telefonu yüzüne çok yakın tutar.
- Öneri: insan karakter ama böceklerle aynı dil: daire yüz (ten rengi tek düz renk), topuz = ikinci daire,
  hırka #1E3FAE, gözlük çerçevesi kalın siyah. Telefon ekranı ona dönük; ekran ışığı yüzde açık bir leke.
  Ekranın çoğu sahte mesajlaşma arayüzü olacağından karakter çoğunlukla göğüs çekimi (büst) yeter.
- İfadeler aynı 4'lü + "telefona kısarak bakma" (gözlük burna kayar) ve "sesli mesaj kaydı" (telefon ağza).
- Ses: sevecen, yüksek enerjili, cümleleri uzun ve kesintisiz, "kızım/oğlum" hitabı. Alay değil sevgi tonu.

## Nermin Teyze — çizildi (2026-11-26): `src/kisacasi/karakterler/NerminTeyze.tsx`

- **Props:** `size`, `ifade`, `konusuyor`, `telefonuYaklastiriyor` (boolean ya da 0-1 sayı), isteğe bağlı `yon`,
  `kirpmaGecikmesi`. `true` verilirse bulunduğu `<Sequence>`'in ilk 10 karesinde hafif taşmalı (overshoot) eğriyle yaklaşır;
  sahne kendisi sürmek isterse `interpolate` ile 0-1 sayı verilir (önizlemede ve animatikte böyle).
- **Kadraj:** göğüs çekimi (büst). 600x600 viewBox; hırka alttan y=600'e kadar iner ve orada kesilir (clipPath),
  böylece karakter kadrajın alt kenarına oturur. Böceklerin zemin çizgisi y=540; Nermin'i onlarla aynı sahneye koyarken
  60 px aşağı kaydır. Yuvarlak "görüntülü arama" çerçevesinde boyut ≈ çerçeve çapı x 1,45, sol -0,22, üst -0,10.
- **Görünüş ve oran:** yüz r=128 (ten #F6C29A), gri-kahve topuz (#A3938A, r=60) + kırmızı toka; kalın siyah yuvarlak
  gözlük (cam r=46, çerçeve 12 px) ve **sarı noktalı gözlük zinciri**; inci küpe ve inci kolye; mavi hırka (#1E3FAE),
  krem bluz, sarı düğmeler, omuzda örgü çizgileri. Telefon: arkası bize dönük **kırmızı kılıf + sarı çiçek çıkartması**
  (seri tanıma işareti), eli telefonun arkasını kavrar. Ekran ışığı yüzün telefon tarafında açık mavi bir leke.
- **İfadeler (aynı 4'lü):** mutlu = **ışıl ışıl kapalı yay gözler** + gülme çizgileri + koyu yanak (göz kırpma bu ifadede
  görünmez, bilerek); şaşkın = gözler %16 büyük, "O" ağız, **gözlük 28 px burnun ucuna kayar**, topuz üstünde 4 şok çizgisi;
  sinirli = çatık gri kaşlar + şakakta **kırmızı** öfke işareti; üzgün = iç uçlar yukarı kaş, ters kavis ağız, gözyaşı.
  Senaryo 03'teki adlar: `isil` = mutlu, `sitem` = sinirli, `saskin` = şaşkın, `bekliyor` ≈ üzgün (yüz düşer).
- **Telefonu yaklaştırma:** telefon (470,318) → (414,236), ölçek 1 → 1,22, kafa 5° geriye ve 10 px geri; gözler
  %45 kısılır, kaşlar çatılır, gözlük 16 px kayar, telefon 2,2 Hz'de hafif titrer (kısarak okuma). Telefon sağ camın
  yarısını kapatır ama ağız açıkta kalır (konuşma okunabilsin diye; ilk denemede 1,35 ölçek ağzı kapatıyordu).
- **Ses tonu:** değişmedi (yukarıdaki not). İmza: "Gruba atıyorum, herkes görsün!" + gönder tuşuna kararlı basış.
- **Ton kuralı:** sevecen; yaşı gösteren işaretler (gülme çizgileri, gözlük zinciri, inci) şefkatli ayrıntı, karikatürize
  edilmiş kusur değil (kırışık yüz, takma diş, kambur yok). Kural denetimi: "yaşlılarla alay aşağılamaya dönmemeli".
- **Eksik (sonraki):** sesli mesaj pozu (telefon ağza), dev başparmakla basma (şimdilik `GrupMenusu`'nda düğme
  basılma animasyonu var, el yok), ifade geçişlerinde ara kare.

## Anne — çizildi (2026-11-27): `src/kisacasi/karakterler/Anne.tsx`

- **Props:** `size`, `ifade`, `konusuyor`, isteğe bağlı `kepceSalliyor` (kepçe kolu ±18°, 2 Hz), `kucakliyor` (0 normal, 0,5 kollar iki yana açık,
  1 kollar ortada kapanır; boolean = 1), `elSalliyor` (serbest el kalkar, el sallar), `yon`, `kirpmaGecikmesi`, `gozParlasi` (gözlerde 4 köşeli
  yıldız), `kepceKaldir` (0-1, kepçe baş hizasına), `kepce` (false = kepçe gizli; kucaklarken kullanılır).
- **Kadraj:** göğüs çekimi (büst) + iki kol, 600x600 viewBox; önlük ve bluz y=600'de kesilir (clipPath, `useId`). Nermin'le aynı zemin çizgisi mantığı.
- **Görünüş:** yuvarlak yüz (ten #E8B48A, Nermin'den bir ton koyu), **kısa dalgalı koyu kahve saç** (#4A2A18) ve 4 yarım daireli kâkül, gözlük yok,
  göz kenarında iki kısa kirpik, küçük altın halka küpe, mutluda hafif gülme çizgileri. **Kırmızı önlük** (krem puantiye, omuz askılı) üstünde **sarı bluz**;
  kollar sarı. Elinde **mavi saplı çelik kepçe** (tanıma işareti).
- **İfadeler:** aynı 4'lü. Mutlu = açık gözler + büyük parıltı + pembe yanak (Nermin'in kapalı yay gözünden bilerek ayrı); `gozParlasi` ile yıldız gözler.
- **Ton:** cömert, hızlı, asla kızmaz; yaş işareti yalnızca hafif gülme çizgileri.
- **Kullanım notu:** kapı boşluğunda `size` 700, kutusu y=1290'da biter. Kucaklarken `kepce={false}` ver.
- **Eksik:** sinirli/üzgün ifadeler videoda hiç kullanılmadı, yalnızca önizlemeye bakılmadı; kollar iki eklemsiz tek eğri.

## Sahte mesajlaşma ekranı — çizildi (2026-11-26): `src/kisacasi/MesajEkrani.tsx`

- Dışa açılanlar: `MesajEkrani` (grup sohbeti), `BildirimYigini` (kilit ekranı + yığılan bildirimler),
  `GrupMenusu` (küçük gri "Üyeleri çıkar" + dev kırmızı "GRUPTAN ÇIK"), `YuvarlakCerceve` (köşedeki karakter çerçevesi,
  `karartma` ile "pıt" diye kararır), `GunaydinGorseli` (gül, çayKedi, simliCay), `TelefonGovdesi`.
- Mesaj listesi tek akış: `metin`, `gorsel`, `sistem`, `yaziyor`, `goruldu` öğeleri; her biri `kare` (girer) ve
  isteğe bağlı `bitis` (çıkar). Yeni öğe giriş çubuğunun altından kayıp yığını yukarı iter; yükseklikler satır kırma
  ile önceden hesaplanır (DOM ölçümü yok, render kararlı). `yazamazKaresi` = "Bu gruba mesaj gönderemezsiniz.",
  `titresim` = telefon titrer.
- **Özgünlük kuralları (kural denetimi 26.11):** yeşil yok (başlık mavi, gönder düğmesi kırmızı kare + ok), desenli
  duvar kâğıdı yok (düz krem kâğıt + kanalın ince kâğıt dokusu), balon kuyruğu yok (yuvarlak köşe + kalın kontur +
  sert alt gölge), tik yok (yerine "göz + Görüldü: N kişi" hapı), "son görülme" yok (başlıkta yalnızca "N kişi"),
  logo ve uygulama adı yok. Kilit ekranı duvar kâğıdı fotoğraf değil, kanalın yırtık şerit kolajı.
- Günaydın görselleri kendi SVG çizimimiz; yazılar yalnızca "Günaydın / Mutlu Sabahlar / Güzel Bir Gün Dilerim".
  Dinî tebrik yok.
- Senaryo 03'ün animatiği: `src/kisacasi/MesajEkraniOnizleme.tsx` (senaryodaki saniyelerle; ses/altyazı yok,
  Root'a eklenmedi).

## Bulgular günlüğü

- **2026-11-26** — İlk iki karakter çizildi. Önizleme 1080x1920'de 600 px ve 210 px boyutta render edildi;
  4 ifadenin hepsi küçük boyutta da ayırt ediliyor. Kaynak: kendi render'larımız (KarakterOnizleme kareleri 20,
  75, 105, 112, 160, 165).
- **2026-11-26** — Siyah kafalı karakterde (Uğur Hoca) siyah kaş/ağız okunmuyor; ifadeyi beyaz kaş ve bıyık,
  ağız çizgisini krem renkle vermek gerekti. Aynı sorun Hamdi Bey'de (koyu kahverengi) çıkacak: yüz detayları
  açık renkle çizilmeli.
- **2026-11-26** — Senaryo 01, Kazım için bugünkü bileşende olmayan durumlar istiyor: tek kaş kaldırma,
  yanak şişirip morarma, bükük antenin yavaşça düşmesi, kameraya dönük kapak pozu. Sonraki sürümde prop olarak
  eklenecek (bkz. rapor). Kaynak: `strategy/senaryolar/01-ev-arkadasi-araniyor.md` satır 29, 33, 46.
- **2026-11-26** — Nermin Teyze ve mesaj ekranı çizildi. KarakterOnizleme kare 20 ve 95'te, animatik kare 30, 44, 118,
  200, 320, 345, 450, 560, 710, 730'da render edilip incelendi. Bulunan ve düzeltilen hatalar: yakın pozda telefon ağzı
  kapatıyordu (ölçek 1,35 → 1,22); kol kadraj altına taşıp etiketi örtüyordu (clipPath); ekran ışığı yüzü iki tonlu
  gösteriyordu (opaklık 0,28 → 0,16); yeni mesaj bir öncekinin üstüne biniyordu (alttan kayarak giriş); kilit
  ekranında giren bildirim saatin üstünden geçiyordu (yerinde büyüyerek giriş, 3 açık kart + sıkışık yığın).
  Kaynak: kendi render'larımız.
- **2026-11-26** — Aynı sayfada birden çok SVG karakter olunca `clipPath` kimlikleri çakışabilir; Nermin'de React
  `useId` (harf-rakam dışı karakterler temizlenerek) kullanıldı. Yeni karakterlerde clipPath/mask gerekiyorsa aynı yol.
- **2026-11-26** — 150 px'te (önizleme alt satırı) Nermin'in 4 ifadesi ayırt ediliyor; en zayıfı sinirli/üzgün farkı
  (ikisinde de gözler açık, fark kaşta ve öfke işaretinde). Kaynak: KarakterOnizleme kare 20.
- **2026-11-27** — Anne ve saklama kabı (`src/kisacasi/Kap.tsx`) çizildi; Video05 karelerinde (0, 40, 70, 110, 150, 200, 290, 372, 440, 520, 590, 640, 689) incelendi. Kapı boşluğunda kollar açıkken el kadrajın dışına taştığı için açık poz eli x=50/550'ye çekildi. Kaynak: kendi render'larımız.
