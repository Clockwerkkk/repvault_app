import type { Language } from "./messages";

const categoryRuBySlug: Record<string, string> = {
  chest: "Грудь",
  back: "Спина",
  legs: "Ноги",
  shoulders: "Плечи",
  biceps: "Бицепс",
  triceps: "Трицепс",
  "abs-core": "Пресс/Кор",
  "full-body": "Все тело"
};

const exerciseRuByName: Record<string, string> = {
  "Barbell Bench Press": "Жим штанги лежа",
  "Incline Barbell Bench Press": "Жим штанги на наклонной скамье",
  "Decline Barbell Bench Press": "Жим штанги на скамье с отрицательным наклоном",
  "Dumbbell Bench Press": "Жим гантелей лежа",
  "Incline Dumbbell Press": "Жим гантелей на наклонной скамье",
  "Decline Dumbbell Press": "Жим гантелей на скамье с отрицательным наклоном",
  "Machine Chest Press": "Жим в тренажере на грудь",
  "Smith Machine Bench Press": "Жим в машине Смита",
  "Cable Chest Fly": "Сведение рук в кроссовере",
  "Dumbbell Fly": "Разводка гантелей лежа",
  "Pec Deck Fly": "Сведение рук в пек-деке",
  "Push-Up": "Отжимания",
  "Conventional Deadlift": "Классическая становая тяга",
  "Romanian Deadlift": "Румынская тяга",
  "Rack Pull": "Тяга с плинтов",
  "Pull-Up": "Подтягивания",
  "Chin-Up": "Подтягивания обратным хватом",
  "Lat Pulldown": "Тяга верхнего блока",
  "Close Grip Lat Pulldown": "Тяга верхнего блока узким хватом",
  "Seated Cable Row": "Тяга горизонтального блока сидя",
  "Bent Over Barbell Row": "Тяга штанги в наклоне",
  "T-Bar Row": "Тяга Т-грифа",
  "One Arm Dumbbell Row": "Тяга гантели одной рукой",
  "Chest Supported Row": "Тяга с упором грудью",
  "Straight Arm Pulldown": "Пуловер на верхнем блоке",
  "Back Squat": "Присед со штангой на спине",
  "Front Squat": "Фронтальный присед",
  "Goblet Squat": "Гоблет-присед",
  "Hack Squat": "Гакк-присед",
  "Leg Press": "Жим ногами",
  "Bulgarian Split Squat": "Болгарские выпады",
  "Walking Lunges": "Выпады в ходьбе",
  "Leg Extension": "Разгибание ног в тренажере",
  "Seated Leg Curl": "Сгибание ног сидя",
  "Lying Leg Curl": "Сгибание ног лежа",
  "Hip Thrust": "Ягодичный мост со штангой",
  "Glute Bridge": "Ягодичный мост",
  "Standing Calf Raise": "Подъемы на носки стоя",
  "Seated Calf Raise": "Подъемы на носки сидя",
  "Donkey Calf Raise": "Подъемы на носки в наклоне",
  "Standing Overhead Press": "Жим штанги стоя",
  "Seated Dumbbell Shoulder Press": "Жим гантелей сидя",
  "Arnold Press": "Жим Арнольда",
  "Machine Shoulder Press": "Жим на плечи в тренажере",
  "Dumbbell Lateral Raise": "Подъемы гантелей в стороны",
  "Cable Lateral Raise": "Подъемы руки в сторону на блоке",
  "Rear Delt Fly": "Разводка на заднюю дельту",
  "Reverse Pec Deck": "Обратный пек-дек",
  "Face Pull": "Тяга к лицу",
  "Front Raise": "Подъемы гантелей перед собой",
  "Upright Row": "Тяга штанги к подбородку",
  "Barbell Shrug": "Шраги со штангой",
  "Barbell Curl": "Подъем штанги на бицепс",
  "EZ Bar Curl": "Подъем EZ-штанги на бицепс",
  "Alternating Dumbbell Curl": "Попеременный подъем гантелей на бицепс",
  "Hammer Curl": "Молотковые сгибания",
  "Incline Dumbbell Curl": "Сгибание гантелей на наклонной скамье",
  "Preacher Curl": "Сгибание на скамье Скотта",
  "Cable Curl": "Сгибание рук на блоке",
  "Concentration Curl": "Концентрированное сгибание",
  "Spider Curl": "Спайдер-сгибание",
  "Machine Biceps Curl": "Сгибание на бицепс в тренажере",
  "Triceps Pushdown": "Разгибание рук на блоке",
  "Rope Triceps Pushdown": "Разгибание рук на блоке с канатом",
  "Skull Crusher": "Французский жим лежа",
  "Overhead Triceps Extension": "Разгибание руки из-за головы",
  "Cable Overhead Triceps Extension": "Разгибание рук из-за головы на блоке",
  "Close Grip Bench Press": "Жим лежа узким хватом",
  "Bench Dip": "Обратные отжимания от скамьи",
  "Parallel Bar Dip": "Отжимания на брусьях",
  "Single Arm Cable Pushdown": "Разгибание одной рукой на блоке",
  "Machine Triceps Extension": "Разгибание на трицепс в тренажере",
  "Cable Crunch": "Скручивания на блоке",
  Crunch: "Скручивания",
  "Decline Sit-Up": "Подъем корпуса на наклонной скамье",
  "Hanging Knee Raise": "Подъем коленей в висе",
  "Hanging Leg Raise": "Подъем ног в висе",
  "Ab Wheel Rollout": "Прокатка с роликом",
  Plank: "Планка",
  "Side Plank": "Боковая планка",
  "Russian Twist": "Русский твист",
  "Machine Crunch": "Скручивания в тренажере",
  "Power Clean": "Подъем штанги на грудь",
  "Clean and Press": "Подъем на грудь и жим",
  Thruster: "Трастер",
  "Snatch Grip Deadlift": "Становая тяга рывковым хватом",
  "Farmer Carry": "Фермерская прогулка",
  "Kettlebell Swing": "Махи гирей",
  "Barbell Complex": "Комплекс со штангой",
  Burpee: "Берпи",
  "Sled Push": "Толкание саней",
  "Sled Pull": "Тяга саней",
  "Man Maker": "Мэн-мейкер",
  "Turkish Get-Up": "Турецкий подъем"
};

export function localizeCategoryName(language: Language, slug: string, fallbackName: string): string {
  if (language !== "ru") {
    return fallbackName;
  }

  return categoryRuBySlug[slug] ?? fallbackName;
}

export function localizeExerciseName(language: Language, fallbackName: string): string {
  if (language !== "ru") {
    return fallbackName;
  }

  return exerciseRuByName[fallbackName] ?? fallbackName;
}
