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

## Nermin Teyze — rehber notu, çizim sonra (yayın planında 1. video, öncelikli)

- 04-konular §1.2: yuvarlak yüz, topuz saç, kalın çerçeveli gözlük, mavi hırka, telefonu yüzüne çok yakın tutar.
- Öneri: insan karakter ama böceklerle aynı dil: daire yüz (ten rengi tek düz renk), topuz = ikinci daire,
  hırka #1E3FAE, gözlük çerçevesi kalın siyah. Telefon ekranı ona dönük; ekran ışığı yüzde açık bir leke.
  Ekranın çoğu sahte mesajlaşma arayüzü olacağından karakter çoğunlukla göğüs çekimi (büst) yeter.
- İfadeler aynı 4'lü + "telefona kısarak bakma" (gözlük burna kayar) ve "sesli mesaj kaydı" (telefon ağza).
- Ses: sevecen, yüksek enerjili, cümleleri uzun ve kesintisiz, "kızım/oğlum" hitabı. Alay değil sevgi tonu.

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
