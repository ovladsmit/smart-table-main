import { makeIndex } from "./lib/utils.js";
const BASE_URL = "https://webinars.webdev.education-services.ru/sp7-api";
export function initData(sourceData) {
  // переменные для кеширования данных
  let sellers;
  let customers;
  let lastResult;
  let lastQuery;

  // функция для приведения строк в тот вид, который нужен нашей таблице
  const mapRecords = (data) =>
    data.map((item) => ({
      id: item.receipt_id,
      date: item.date,
      seller: sellers[item.seller_id],
      customer: customers[item.customer_id],
      total: item.total_amount,
    }));

  // функция получения индексов
  const getIndexes = async () => {
    if (!sellers || !customers) {
      // если индексы ещё не установлены, то делаем запросы
      [sellers, customers] = await Promise.all([
        // запрашиваем и деструктурируем в уже объявленные ранее переменные
        fetch(`${BASE_URL}/sellers`).then((res) => res.json()), // запрашиваем продавцов
        fetch(`${BASE_URL}/customers`).then((res) => res.json()), // запрашиваем покупателей
      ]);
    }

    return { sellers, customers };
  };

  // функция получения записей о продажах с сервера
  const getRecords = async (query, isUpdated = false) => {
    const qs = new URLSearchParams(query); // преобразуем объект параметров в SearchParams объект, представляющий query часть url
    const nextQuery = qs.toString(); // и приводим к строковому виду

    if (lastQuery === nextQuery && !isUpdated) {
      // isUpdated параметр нужен, чтобы иметь возможность делать запрос без кеша
      return lastResult; // если параметры запроса не поменялись, то отдаём сохранённые ранее данные
    }

    // если прошлый квери не был ранее установлен или поменялись параметры, то запрашиваем данные с сервера
    const response = await fetch(`${BASE_URL}/records?${nextQuery}`);
    const records = await response.json();

    lastQuery = nextQuery; // сохраняем для следующих запросов
    lastResult = {
      total: records.total,
      items: mapRecords(records.items),
    };

    return lastResult;
  };

  return {
    getIndexes,
    getRecords,
  };
}

/** ФУНКЦИЯ ДЕЛАЕТ ИЗ DATASET ЧЕЛОВЕЧЕСКИЙ ВИД НА ВЫХОДЕ ПОЛУЧАЕМ ПРИМЕРНО ЭТО
  {
  sellers: {
    seller_1: "Ivan Petrov",
    seller_2: "Olga Sidorova"
  },

  customers: {
    customer_1: "Andrey Alekseev",
    customer_2: "Petr Smirnov"
  },

  data: [
    {
      id: "r_101",
      date: "2024-01-10",
      seller: "Ivan Petrov",
      customer: "Petr Smirnov",
      total: 1250
    },
    {
      id: "r_102",
      date: "2024-01-11",
      seller: "Olga Sidorova",
      customer: "Andrey Alekseev",
      total: 540
    }
  ]
}
 */
