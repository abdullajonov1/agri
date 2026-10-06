import { React } from "jimu-core";
import ReactDOM from "react-dom";
import { ChevronRight, FunctionSquare, Sprout, X } from "lucide-react";
import type { GeoWidgetState } from "../../widget";

export const INDEX_INFO: Array<{
  key: string;
  color: string;
  ru: string;
  uz_lat: string;
  uz_cyr: string;
  en?: string;
  formula: string;
  range: { ru: string; uz_lat: string; uz_cyr: string; en?: string };
  details: { ru: string; uz_lat: string; uz_cyr: string; en?: string };
}> = [
  {
    key: "NDVI",
    color: "#00d084",
    en: "Vegetation index showing plant density and health.",
    ru: "Индекс вегетации — показывает густоту и здоровье растительности.",
    uz_lat: "Vegetatsiya indeksi — o‘simliklarning zichligi va sog‘lig‘ini ko‘rsatadi.",
    uz_cyr: "Вegetatsiya индекси — ўсимликларнинг зичлиги ва соғлигини кўрсатади.",
    formula: "NDVI = (NIR − Red) / (NIR + Red)",
    range: {
      en: "From -1 to 1. Bare soil: 0-0.2; sparse vegetation: 0.2-0.4; healthy dense crops: 0.4-0.9.",
      ru: "От −1 до 1. Голая почва: 0–0.2. Разреженная растительность: 0.2–0.4. Здоровые густые посевы: 0.4–0.9. Вода и облака чаще всего дают отрицательные значения.",
      uz_lat: "−1 dan 1 gacha. Ochiq tuproq: 0–0.2. Siyrak o‘simlik: 0.2–0.4. Sog‘lom, zich ekin: 0.4–0.9. Suv va bulutlar odatda manfiy qiymat beradi.",
      uz_cyr: "−1 дан 1 гача. Очиқ тупроқ: 0–0.2. Сийрак ўсимлик: 0.2–0.4. Соғлом, зич экин: 0.4–0.9. Сув ва булутлар одатда манфий қиймат беради.",
    },
    details: {
      en: "Measures near-infrared reflection and red-light absorption to monitor crop health, biomass, drought, and plant stress. It can saturate in very dense vegetation and is sensitive to exposed soil early in the season.",
      ru: "Показывает контраст между сильным отражением здоровой листвы в ближнем инфракрасном (NIR) диапазоне и поглощением хлорофиллом в красном (Red) диапазоне. Применяется для мониторинга состояния посевов, оценки биомассы, раннего выявления засухи и стресса растений, а также для сравнения полей по сезонам. Ограничение: индекс насыщается (перестаёт расти) при очень густом растительном покрове и чувствителен к цвету и влажности открытой почвы на ранних стадиях роста.",
      uz_lat: "Sog‘lom bargning yaqin infraqizil (NIR) diapazonda kuchli qaytarilishi va xlorofillning qizil (Red) diapazonda yutilishi orasidagi farqni ko‘rsatadi. Ekinlar holatini kuzatish, biomassani baholash, qurg‘oqchilik va o‘simlik stressini erta aniqlash, shuningdek dalalarni mavsumlar bo‘yicha solishtirish uchun qo‘llaniladi. Cheklovi: juda zich o‘simlik qoplamida indeks to‘yinadi (o‘sishdan to‘xtaydi) va o‘sish boshida ochiq tuproq rangi hamda namligiga sezgir bo‘ladi.",
      uz_cyr: "Соғлом баргнинг яқин инфрақизил (NIR) диапазонда кучли қайтарилиши ва хлорофиллнинг қизил (Red) диапазонда ютилиши орасидаги фарқни кўрсатади. Экинлар ҳолатини кузатиш, биомассани баҳолаш, қурғоқчилик ва ўсимлик стрессини эрта аниқлаш, шунингдек далаларни мавсумлар бўйича солиштириш учун қўлланилади. Чекловi: жуда зич ўсимлик қопламида индекс тўйинади (ўсишдан тўхтайди) ва ўсиш бошида очиқ тупроқ ранги ҳамда намлигига сезгир бўлади.",
    },
  },
  {
    key: "SAVI",
    color: "#7aa5ff",
    en: "Soil-adjusted NDVI that is more accurate for sparse vegetation.",
    ru: "NDVI с поправкой на яркость почвы — точнее при редкой растительности.",
    uz_lat: "Tuproq yorqinligiga tuzatilgan NDVI — siyrak o‘simlikda aniqroq.",
    uz_cyr: "Тупроқ ёрқинлигига тузатилган NDVI — сийрак ўсимликда аниқроқ.",
    formula: "SAVI = [(NIR − Red) / (NIR + Red + L)] × (1 + L), L ≈ 0.5",
    range: {
      en: "Close to -1 to 1 and most useful when vegetation cover is below 40%.",
      ru: "Диапазон близок к NDVI (−1…1), но значения обычно немного ниже за счёт поправочного коэффициента L. Наиболее полезен при покрытии растительностью менее 40%.",
      uz_lat: "Diapazon NDVI ga yaqin (−1…1), lekin L koeffitsiyenti tufayli qiymatlar odatda biroz past bo‘ladi. O‘simlik qoplami 40% dan kam bo‘lganda eng foydali.",
      uz_cyr: "Диапазон NDVI га яқин (−1…1), лекин L коэффициенти туфайли қийматлар одатда бироз паст бўлади. Ўсимлик қоплами 40% дан кам бўлганда энг фойдали.",
    },
    details: {
      en: "Reduces the effect of exposed-soil brightness in sparsely covered fields. The L factor controls the correction and improves early-season crop assessment when soil is visible between rows.",
      ru: "Устраняет влияние яркости открытой почвы, которое искажает NDVI на полях с редким растительным покровом — например, сразу после посева или в засушливых и полузасушливых регионах. Коэффициент L (обычно 0.5) регулирует степень поправки в зависимости от плотности покрова. Особенно полезен на ранних фазах развития хлопчатника, пшеницы и других культур, когда между рядами хорошо видна почва, и позволяет получить более достоверную оценку состояния именно растений, а не фона.",
      uz_lat: "Siyrak o‘simlik qoplamli dalalarda — masalan ekishdan keyin darhol yoki qurg‘oqchil va yarim qurg‘oqchil hududlarda — NDVI ni buzadigan ochiq tuproq yorqinligining ta’sirini kamaytiradi. L koeffitsiyenti (odatda 0.5) qoplam zichligiga qarab tuzatish darajasini boshqaradi. Ayniqsa paxta, bug‘doy va boshqa ekinlarning erta o‘sish fazalarida, qatorlar orasida tuproq yaxshi ko‘rinib turganda foydali bo‘lib, fon emas, aynan o‘simlik holatini aniqroq baholashga yordam beradi.",
      uz_cyr: "Сийрак ўсимлик қопламли далаларда — масалан экишдан кейин дарҳол ёки қурғоқчил ва ярим қурғоқчил ҳудудларда — NDVI ни бузадиган очиқ тупроқ ёрқинлигининг таъсирини камайтиради. L коэффициенти (одатда 0.5) қоплам зичлигига қараб тузатиш даражасини бошқаради. Айниқса пахта, буғдой ва бошқа экинларнинг эрта ўсиш фазаларида, қаторлар орасида тупроқ яхши кўриниб турганда фойдали бўлиб, фон эмас, айнан ўсимлик ҳолатини аниқроқ баҳолашга ёрдам беради.",
    },
  },
  {
    key: "RVI",
    color: "#ffb347",
    en: "Near-infrared to red-band ratio that is sensitive to biomass.",
    ru: "Отношение ближнего ИК к красному каналу — чувствителен к биомассе.",
    uz_lat: "Yaqin infraqizil va qizil kanal nisbati — biomassaga sezgir.",
    uz_cyr: "Яқин инфрақизил ва қизил канал нисбати — биомассага сезгир.",
    formula: "RVI (SR) = NIR / Red",
    range: {
      en: "From 0 upward. Bare soil is near 1; dense healthy vegetation is often above 5-8.",
      ru: "От 0 до бесконечности. Голая почва: около 1. Разреженная растительность: 1–3. Густая здоровая растительность: часто выше 5–8.",
      uz_lat: "0 dan cheksizlikkacha. Ochiq tuproq: taxminan 1. Siyrak o‘simlik: 1–3. Zich sog‘lom o‘simlik: ko‘pincha 5–8 dan yuqori.",
      uz_cyr: "0 дан чексизликкача. Очиқ тупроқ: тахминан 1. Сийрак ўсимлик: 1–3. Зич соғлом ўсимлик: кўпинча 5–8 дан юқори.",
    },
    details: {
      en: "Also known as Simple Ratio. It responds strongly to biomass changes where NDVI may saturate, but is more sensitive to atmospheric effects and soil noise.",
      ru: "Также известен как Simple Ratio (SR). Из-за нелинейной (не нормализованной) формулы сильнее реагирует на изменения биомассы и листового индекса (LAI) в посевах с высокой плотностью растительности, где NDVI уже насыщен — например, в развитом хлопчатнике, кукурузе или садах. Недостаток: сильнее подвержен влиянию атмосферных искажений и шума открытой почвы, чем нормализованные индексы, поэтому чаще используется как дополнение к NDVI, а не замена ему.",
      uz_lat: "Shuningdek Simple Ratio (SR) nomi bilan ham tanilgan. Chiziqli bo‘lmagan (normallashtirilmagan) formulasi tufayli, NDVI allaqachon to‘yingan yuqori zichlikdagi ekinlarda — masalan, rivojlangan paxta, makkajo‘xori yoki bog‘larda — biomassa va bargu indeksi (LAI) o‘zgarishlariga kuchliroq javob beradi. Kamchiligi: normallashtirilgan indekslarga qaraganda atmosfera buzilishlari va ochiq tuproq shovqiniga ko‘proq ta’sirlanadi, shuning uchun ko‘pincha NDVI ni almashtiruvchi emas, unga qo‘shimcha sifatida ishlatiladi.",
      uz_cyr: "Шунингдек Simple Ratio (SR) номи билан ҳам танилган. Чизиқли бўлмаган (нормаллаштирилмаган) формуласи туфайли, NDVI аллақачон тўйинган юқори зичликдаги экинларда — масалан, ривожланган пахта, маккажўхори ёки боғларда — биомасса ва баргу индекси (LAI) ўзгаришларига кучлироқ жавоб беради. Камчилиги: нормаллаштирилган индексларга қараганда атмосфера бузилишлари ва очиқ тупроқ шовқинига кўпроқ таъсирланади, шунинг учун кўпинча NDVI ни алмаштирувчи эмас, унга қўшимча сифатида ишлатилади.",
    },
  },
  {
    key: "CI",
    color: "#c78bff",
    en: "Chlorophyll index used to estimate leaf chlorophyll and nitrogen content.",
    ru: "Индекс хлорофилла — оценивает содержание хлорофилла/азота в листьях.",
    uz_lat: "Xlorofill indeksi — bargdagi xlorofill/azot miqdorini baholaydi.",
    uz_cyr: "Хлорофилл индекси — баргдаги хлорофилл/азот миқдорини баҳолайди.",
    formula: "CIgreen = (NIR / Green) − 1",
    range: {
      en: "Usually 0 to 15+. Low values can indicate weak vegetation or nitrogen deficiency.",
      ru: "Обычно от 0 до 15+. Низкие значения (0–2) указывают на слабую вегетацию или дефицит азота. Значения выше 4–5 характерны для хорошо удобренных, богатых хлорофиллом посевов.",
      uz_lat: "Odatda 0 dan 15+ gacha. Past qiymatlar (0–2) zaif vegetatsiya yoki azot yetishmovchiligini bildiradi. 4–5 dan yuqori qiymatlar yaxshi o‘g‘itlangan, xlorofillga boy ekinlarga xos.",
      uz_cyr: "Одатда 0 дан 15+ гача. Паст қийматлар (0–2) заиф вегетация ёки азот етишмовчилигини билдиради. 4–5 дан юқори қийматлар яхши ўғитланган, хлорофиллга бой экинларга хос.",
    },
    details: {
      en: "Estimates chlorophyll and indirectly nitrogen status. It can reveal nutrient deficiency and stress early, supporting timely fertilization. Green and Red Edge variants use different spectral bands.",
      ru: "В отличие от NDVI, напрямую нацелен на оценку концентрации хлорофилла и, косвенно, азота в листьях — важнейшего показателя питания растений. Это делает его ценным инструментом для точного земледелия: индекс способен выявлять дефицит азота и другие признаки стресса ещё до того, как они станут заметны визуально или отразятся на NDVI, что позволяет своевременно скорректировать программу подкормки. Используется как в «зелёной» (Green), так и в «красный край» (Red Edge) версиях, отличающихся спектральным каналом сравнения с NIR.",
      uz_lat: "NDVI dan farqli o‘laroq, to‘g‘ridan-to‘g‘ri bargdagi xlorofill konsentratsiyasini va bilvosita azotni — o‘simlik ozuqasining eng muhim ko‘rsatkichini — baholashga qaratilgan. Bu uni aniq dehqonchilik uchun qimmatli qurolga aylantiradi: indeks azot yetishmovchiligi va boshqa stress belgilarini ular ko‘zga tashlanishidan yoki NDVI da aks etishidan oldinroq aniqlay oladi, bu esa oziqlantirish dasturini o‘z vaqtida to‘g‘rilash imkonini beradi. «Yashil» (Green) va «qizil chekka» (Red Edge) versiyalarida qo‘llaniladi, ular NIR bilan solishtiriladigan spektral kanali bilan farqlanadi.",
      uz_cyr: "NDVI дан фарқли ўлароқ, тўғридан-тўғри баргдаги хлорофилл концентрациясини ва билвосита азотни — ўсимлик озуқасининг энг муҳим кўрсаткичини — баҳолашга қаратилган. Бу уни аниқ деҳқончилик учун қимматли қуролга айлантиради: индекс азот етишмовчилиги ва бошқа стресс белгиларини улар кўзга ташланишидан ёки NDVI да акс этишидан олдинроқ аниқлай олади, бу эса озиқлантириш дастурини ўз вақтида тўғрилаш имконини беради. «Яшил» (Green) ва «қизил чекка» (Red Edge) версияларида қўлланилади, улар NIR билан солиштириладиган спектрал канали билан фарқланади.",
    },
  },
  {
    key: "EVI",
    color: "#ff4d8d",
    en: "Enhanced vegetation index that performs better in dense vegetation.",
    ru: "Улучшенный индекс вегетации — точнее при густой растительности.",
    uz_lat: "Takomillashtirilgan vegetatsiya indeksi — zich o‘simlikda aniqroq.",
    uz_cyr: "Такомиллаштирилган вегетатsiya индекси — зич ўсимликда аниқроқ.",
    formula: "EVI = 2.5 × (NIR − Red) / (NIR + 6×Red − 7.5×Blue + 1)",
    range: {
      en: "From -1 to 1; values above 0.5-0.6 indicate very dense, productive vegetation.",
      ru: "От −1 до 1 (практически рабочий диапазон 0–1). Значения выше 0.5–0.6 указывают на очень плотную, высокопродуктивную растительность (сады, зрелый хлопчатник, лес).",
      uz_lat: "−1 dan 1 gacha (amalda ish diapazoni 0–1). 0.5–0.6 dan yuqori qiymatlar juda zich, yuqori mahsuldor o‘simlikni bildiradi (bog‘lar, yetilgan paxta, o‘rmon).",
      uz_cyr: "−1 дан 1 гача (амалда иш диапазони 0–1). 0.5–0.6 дан юқори қийматлар жуда зич, юқори маҳсулдор ўсимликни билдиради (боғлар, етилган пахта, ўрмон).",
    },
    details: {
      en: "Uses the blue band and correction coefficients to reduce atmospheric and soil effects. It saturates less quickly than NDVI in dense vegetation but requires well-corrected imagery.",
      ru: "Включает синий (Blue) канал для коррекции атмосферного рассеяния и влияния аэрозолей, а также использует коэффициенты (обычно G=2.5, C1=6, C2=7.5, L=1) для снижения влияния фона почвы. Главное преимущество — индекс не «насыщается» так быстро, как NDVI, в зонах с очень плотным растительным покровом (садах, зрелых посевах хлопчатника или кукурузы), сохраняя чувствительность к изменениям биомассы там, где NDVI уже перестаёт информативно расти. Требует более качественных, атмосферно скорректированных снимков из-за использования синего канала.",
      uz_lat: "Atmosfera sochilishi va aerozollar ta’sirini tuzatish uchun ko‘k (Blue) kanalni o‘z ichiga oladi, shuningdek tuproq foni ta’sirini kamaytirish uchun koeffitsiyentlardan (odatda G=2.5, C1=6, C2=7.5, L=1) foydalanadi. Asosiy afzalligi — juda zich o‘simlik qoplamli hududlarda (bog‘lar, yetilgan paxta yoki makkajo‘xori ekinlari) NDVI kabi tezda «to‘yinib qolmaydi», NDVI informativ o‘sishdan to‘xtagan joyda ham biomassa o‘zgarishlariga sezgirligini saqlaydi. Ko‘k kanaldan foydalanish tufayli sifatliroq, atmosfera bo‘yicha tuzatilgan tasvirlarni talab qiladi.",
      uz_cyr: "Атмосфера сочилиши ва аэрозоллар таъсирини тузатиш учун кўк (Blue) канални ўз ичига олади, шунингдек тупроқ фони таъсирини камайтириш учун коэффициентлардан (одатда G=2.5, C1=6, C2=7.5, L=1) фойдаланади. Асосий афзаллиги — жуда зич ўсимлик қопламли ҳудудларда (боғлар, етилган пахта ёки маккажўхори экинлари) NDVI каби тезда «тўйиниб қолмайди», NDVI информатив ўсишдан тўхтаган жойда ҳам биомасса ўзгаришларига сезгирлигини сақлайди. Кўк каналдан фойдаланиш туфайли сифатлироқ, атмосфера бўйича тузатилган тасвирларни талаб қилади.",
    },
  },
  {
    key: "NDWI",
    color: "#2ec4f1",
    en: "Moisture index showing water content in plants or soil.",
    ru: "Индекс влажности — показывает содержание влаги в растениях/почве.",
    uz_lat: "Namlik indeksi — o‘simlik/tuproqdagi namlik miqdorini ko‘rsatadi.",
    uz_cyr: "Намлик индекси — ўсимлик/тупроқдаги намлик миқдорини кўрсатади.",
    formula: "NDWI = (NIR − SWIR) / (NIR + SWIR)",
    range: {
      en: "From -1 to 1. Negative or near-zero values indicate dryness; values above 0.2-0.3 indicate good moisture.",
      ru: "От −1 до 1. Отрицательные и близкие к нулю значения — сухие растения/почва и признаки водного стресса. Значения выше 0.2–0.3 указывают на хорошее увлажнение тканей растения.",
      uz_lat: "−1 dan 1 gacha. Manfiy va nolga yaqin qiymatlar — quruq o‘simlik/tuproq va suv stressi belgilarini bildiradi. 0.2–0.3 dan yuqori qiymatlar o‘simlik to‘qimalarining yaxshi namlanganligini ko‘rsatadi.",
      uz_cyr: "−1 дан 1 гача. Манфий ва нолга яқин қийматлар — қуруқ ўсимлик/тупроқ ва сув стресси белгиларини билдиради. 0.2–0.3 дан юқори қийматлар ўсимлик тўқималарининг яхши намланганлигини кўрсатади.",
    },
    details: {
      en: "Green-NIR variants identify surface water, while NIR-SWIR variants estimate plant moisture. In agriculture it supports irrigation planning, drought detection, and irrigation-efficiency assessment.",
      ru: "Существуют две версии: на основе зелёного (Green) и NIR каналов — для выделения водных поверхностей на снимках, и на основе NIR и коротковолнового инфракрасного (SWIR) каналов — для оценки влагосодержания в тканях растений. В сельском хозяйстве чаще используется вторая версия — она чувствительна к дефициту воды в листьях ещё до появления видимых признаков увядания, что делает её полезной для планирования полива, раннего выявления засухи и оценки эффективности ирригационных систем на конкретных полях.",
      uz_lat: "Ikkita versiyasi mavjud: suv sathlarini tasvirlarda ajratib ko‘rsatish uchun yashil (Green) va NIR kanallariga asoslangan, va o‘simlik to‘qimalaridagi namlik miqdorini baholash uchun NIR va qisqa to‘lqinli infraqizil (SWIR) kanallariga asoslangan. Qishloq xo‘jaligida ko‘pincha ikkinchi versiya qo‘llaniladi — u barglarda suv tanqisligini ko‘zga ko‘rinadigan so‘lish belgilaridan oldinroq aniqlay oladi, bu esa uni sug‘orishni rejalashtirish, qurg‘oqchilikni erta aniqlash va aniq dalalarda irrigatsiya tizimlari samaradorligini baholash uchun foydali qiladi.",
      uz_cyr: "Иккита версияси мавжуд: сув сатҳларини тасвирларда ажратиб кўрсатиш учун яшил (Green) ва NIR канaлларига асосланган, ва ўсимлик тўқималаридаги намлик миқдорини баҳолаш учун NIR ва қисқа тўлқинли инфрақизил (SWIR) канaлларига асосланган. Қишлоқ хўжалигида кўпинча иккинчи версия қўлланилади — у баргларда сув танқислигини кўзга кўринадиган сўлиш белгиларидан олдинроқ аниқлай олади, бу эса уни суғоришни режалаштириш, қурғоқчиликни эрта аниқлаш ва аниқ далаларда ирригация тизимлари самарадорлигини баҳолаш учун фойдали қилади.",
    },
  },
];

export type IndexInfoDetailProps = Pick<
  GeoWidgetState,
  "openToolbarMenu" | "selectedIndexInfoKey" | "language"
> & {
  closeIndexInfoMenu: () => void;
};

export type IndexInfoMenuProps = IndexInfoDetailProps & {
  _indexInfoToolbarItemRef: React.RefObject<HTMLDivElement>;
  openIndexInfoDetail: (key: string) => void;
};

/** Full detail page for a single selected index — centered overlay, list hidden while open. */
export const IndexInfoDetail = (props: IndexInfoDetailProps) => {
  const { selectedIndexInfoKey, language } = props;
  if (props.openToolbarMenu !== "indexInfo" || !selectedIndexInfoKey)
    return null;

  const item = INDEX_INFO.find(
    (i) => i.key === selectedIndexInfoKey,
  );
  if (!item) return null;

  const formulaLabel =
    language === "en" ? "Formula" : language === "ru" ? "Формула" : language === "uz_lat" ? "Formula" : "Формула";

  return ReactDOM.createPortal(
    <div
      className="agri-v20-index-info-backdrop agri-v20-floating-overlay"
      style={{ zIndex: 2147483002 }}
      onClick={props.closeIndexInfoMenu}
    >
      <div
        className="agri-v20-index-info-detail-card"
        role="dialog"
        aria-label={item.key}
        style={{ ["--index-accent" as any]: item.color }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="agri-v20-index-info-detail-header">
          <div className="agri-v20-index-info-detail-title-row">
            <span
              className="agri-v20-index-info-detail-icon"
              style={{ color: item.color }}
              aria-hidden="true"
            >
              <Sprout size={20} strokeWidth={2.2} />
            </span>
            <h2 className="agri-v20-index-info-detail-title">{item.key}</h2>
          </div>
          <button
            type="button"
            className="agri-v20-index-info-detail-close-btn"
            onClick={props.closeIndexInfoMenu}
            aria-label="Close"
          >
            <X size={18} strokeWidth={2.2} aria-hidden="true" />
          </button>
        </div>

        <p className="agri-v20-index-info-detail-summary">
          {language === "en" ? item.en || item.uz_lat : item[language]}
        </p>

        <div className="agri-v20-index-info-detail-block">
          <div className="agri-v20-index-info-detail-block-label">
            <FunctionSquare size={13} strokeWidth={2.2} aria-hidden="true" />
            {formulaLabel}
          </div>
          <code className="agri-v20-index-info-detail-formula">
            {item.formula}
          </code>
        </div>

        <div className="agri-v20-index-info-detail-block agri-v20-index-info-detail-block--last">
          <p className="agri-v20-index-info-detail-text">
            {language === "en" ? item.details.en || item.details.uz_lat : item.details[language]}
          </p>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export const IndexInfoMenu = (props: IndexInfoMenuProps) => {
  if (props.openToolbarMenu !== "indexInfo") return null;
  if (props.selectedIndexInfoKey) {
    return <IndexInfoDetail {...props} />;
  }

  const anchor = props._indexInfoToolbarItemRef.current;
  if (!anchor) return null;
  const rect = anchor.getBoundingClientRect();
  const { language } = props;

  const headerLabel =
    language === "en"
      ? "About indices"
      : language === "ru"
        ? "Инфо про индексы"
      : language === "uz_lat"
        ? "Indekslar haqida"
        : "Индекслар ҳақида";

  return ReactDOM.createPortal(
    <div
      className="agri-v20-toolbar-popover agri-v20-toolbar-popover-floating agri-v20-floating-overlay agri-v20-index-info-popover"
      style={{
        position: "fixed",
        top: rect.bottom + 10,
        left: Math.max(12, rect.left),
        width: 300,
        maxWidth: "calc(100vw - 24px)",
        zIndex: 2147483001,
      }}
    >
      <div
        className="agri-v20-index-info-menu"
        role="menu"
        aria-label={headerLabel}
      >
        <div className="agri-v20-index-info-header">{headerLabel}</div>
        {INDEX_INFO.map((item) => (
          <div
            className={`agri-v20-index-info-row agri-v20-index-info-row--clickable agri-v20-index-info-row--${item.key.toLowerCase()}`}
            key={item.key}
            role="button"
            tabIndex={0}
            style={{ ["--index-accent" as any]: item.color }}
            onClick={() => props.openIndexInfoDetail(item.key)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                props.openIndexInfoDetail(item.key);
              }
            }}
          >
            <span
              className="agri-v20-index-info-dot"
              style={{ background: item.color }}
              aria-hidden="true"
            />
            <div className="agri-v20-index-info-text">
              <div className="agri-v20-index-info-name">{item.key}</div>
              <div className="agri-v20-index-info-desc">
                {language === "en" ? item.en || item.uz_lat : item[language]}
              </div>
            </div>
            <span className="agri-v20-index-info-chevron" aria-hidden="true">
              <ChevronRight size={16} strokeWidth={2.2} />
            </span>
          </div>
        ))}
      </div>
    </div>,
    document.body,
  );
};
