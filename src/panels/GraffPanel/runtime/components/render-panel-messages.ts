import type { AgriLabel } from "../../../../shared/agri-i18n";

const label = (en: string, ru: string, uz_lat: string, uz_cyr: string): AgriLabel => ({
  en,
  ru,
  uz_lat,
  uz_cyr,
});

export const GRAFF_PANEL_MESSAGES = {
  vhHeader: label("Status", "Состояние", "Holat", "Ҳолат"),
  viloyat: label("Region", "Область", "Viloyat", "Вилоят"),
  tuman: label("District", "Район", "Tuman", "Туман"),
  region: label("Region", "Регион", "Region", "Регион"),
  district: label("District", "Район", "Tuman", "Туман"),
  yil: label("Year", "Год", "Yil", "Йил"),
  turi: label("Crop type", "Тип посева", "Ekin turi", "Экин тури"),
  maydon: label("Area", "Площадь", "Maydon", "Майдон"),
  name: label("Name", "Имя", "Nom", "Ном"),
  shapeLeng: label("Boundary length", "Длина границы", "Chegara uzunligi", "Чегара узунлиғи"),
  globalId: label("Global ID", "Глобальный ID", "Global ID", "Глобал ID"),
  fName: label("Farmer name", "Название фермера", "Fermer nomi", "Фермер номи"),
  fInn: label("TIN", "ИНН", "STIR", "СТИР"),
  fCad: label("Cadastral number", "Кадастровый номер", "Kadastr raqami", "Кадастр рақами"),
  yld: label("Yield", "Урожайность", "Hosildorlik", "Ҳосилдорлик"),
  numericId: label("Numeric ID", "Числовой ID", "Raqamli ID", "Рақамли ID"),
  tableTitle: label("TABLE", "ТАБЛИЦА", "JADVAL", "ЖАДВАЛ"),
  paginationTotal: label("Total", "Всего", "Jami", "Жами"),
  paginationPage: label("Page", "Страница", "Sahifa", "Саҳифа"),
  paginationRows: label("Rows", "Строк", "Qator", "Қатор"),
  fieldsRequiredTitle: label(
    "Widget fields are required",
    "Требуются поля виджета",
    "Widget maydonlari talab qilinadi",
    "Виджет майдонлари талаб қилинади",
  ),
  fieldsRequiredHint: label(
    "Select widget fields in Settings.",
    "Выберите поля виджета в настройках.",
    "Widget maydonlarini sozlamalarda tanlang.",
    "Виджет майдонларини созламаларда танланг.",
  ),
  connectFailed: label(
    "Could not connect to the map. Try again.",
    "Не удалось подключиться к карте. Попробуйте снова.",
    "Xaritaga ulana olmadi. Qayta urinib ko'ring.",
    "Харитага улана олмади. Қайта уриниб кўринг.",
  ),
  reconnect: label("Reconnect", "Подключиться снова", "Qayta ulanish", "Қайта уланиш"),
  retry: label("Retry", "Повторить", "Qayta urinish", "Қайта уриниш"),
} as const satisfies Record<string, AgriLabel>;
