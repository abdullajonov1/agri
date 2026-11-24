export type SwipeLanguage = "uz_lat" | "uz_cyr" | "ru" | "en";

export interface SwipeCopy {
  open: string;
  title: string;
  main: string;
  compare: string;
  available: string;
  chartDate: string;
  loading: string;
  error: string;
  retry: string;
  close: string;
  pickField: string;
  prev: string;
  next: string;
  weekdays: string[];
  months: string[];
}

export const SWIPE_COPY: Record<SwipeLanguage, SwipeCopy> = {
  uz_lat: {
    open: "Rasmlarni solishtirish",
    title: "Solishtirish sanasini tanlang",
    main: "Grafik",
    compare: "Solishtirish",
    available: "Rasm mavjud",
    chartDate: "Grafik sanasi",
    loading: "Rasm yuklanmoqda",
    error: "Rasmni yuklab bo‘lmadi",
    retry: "Qayta urinish",
    close: "Solishtirishni yopish",
    pickField: "Xaritadan maydon tanlang",
    prev: "Oldingi oy",
    next: "Keyingi oy",
    weekdays: ["Du", "Se", "Ch", "Pa", "Ju", "Sh", "Ya"],
    months: ["Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun", "Iyul", "Avgust", "Sentabr", "Oktabr", "Noyabr", "Dekabr"],
  },
  uz_cyr: {
    open: "Расмларни солиштириш",
    title: "Солиштириш санасини танланг",
    main: "График",
    compare: "Солиштириш",
    available: "Расм мавжуд",
    chartDate: "График санаси",
    loading: "Расм юкланмоқда",
    error: "Расмни юклаб бўлмади",
    retry: "Қайта уриниш",
    close: "Солиштиришни ёпиш",
    pickField: "Харитадан майдон танланг",
    prev: "Олдинги ой",
    next: "Кейинги ой",
    weekdays: ["Ду", "Се", "Чо", "Па", "Жу", "Ша", "Як"],
    months: ["Январ", "Феврал", "Март", "Апрел", "Май", "Июн", "Июл", "Август", "Сентабр", "Октабр", "Ноябр", "Декабр"],
  },
  ru: {
    open: "Сравнить снимки",
    title: "Выберите дату сравнения",
    main: "График",
    compare: "Сравнение",
    available: "Есть снимок",
    chartDate: "Дата графика",
    loading: "Снимок загружается",
    error: "Не удалось загрузить снимок",
    retry: "Повторить",
    close: "Закрыть сравнение",
    pickField: "Выберите поле на карте",
    prev: "Предыдущий месяц",
    next: "Следующий месяц",
    weekdays: ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"],
    months: ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"],
  },
  en: {
    open: "Compare snapshots",
    title: "Choose a comparison date",
    main: "Chart",
    compare: "Compare",
    available: "Snapshot available",
    chartDate: "Chart date",
    loading: "Loading snapshot",
    error: "Snapshot could not be loaded",
    retry: "Retry",
    close: "Close comparison",
    pickField: "Select a field on the map",
    prev: "Previous month",
    next: "Next month",
    weekdays: ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"],
    months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
  },
};
