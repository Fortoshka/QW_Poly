// PKZIP Store Archive Generator (Zero Dependencies)
class SimpleZip {
  constructor() {
    this.files = [];
  }

  addFile(filename, content) {
    const encoder = new TextEncoder();
    const data = typeof content === 'string' ? encoder.encode(content) : (content instanceof Uint8Array ? content : new Uint8Array(content));
    this.files.push({ name: filename, data });
  }

  crc32(data) {
    let crc = 0xFFFFFFFF;
    for (let i = 0; i < data.length; i++) {
      let byte = data[i];
      crc ^= byte;
      for (let j = 0; j < 8; j++) {
        crc = (crc >>> 1) ^ ((crc & 1) ? 0xEDB88320 : 0);
      }
    }
    return (crc ^ 0xFFFFFFFF) >>> 0;
  }

  generateBlob() {
    const localHeaders = [];
    const cdHeaders = [];
    let offset = 0;

    for (const file of this.files) {
      const nameBytes = new TextEncoder().encode(file.name);
      const crc = this.crc32(file.data);
      const size = file.data.length;

      const lh = new Uint8Array(30 + nameBytes.length);
      const view = new DataView(lh.buffer);
      view.setUint32(0, 0x04034b50, true);
      view.setUint16(4, 20, true);
      view.setUint16(6, 0, true);
      view.setUint16(8, 0, true);
      view.setUint16(10, 0, true);
      view.setUint16(12, 0, true);
      view.setUint32(14, crc, true);
      view.setUint32(18, size, true);
      view.setUint32(22, size, true);
      view.setUint16(26, nameBytes.length, true);
      view.setUint16(28, 0, true);
      lh.set(nameBytes, 30);

      const cd = new Uint8Array(46 + nameBytes.length);
      const cdView = new DataView(cd.buffer);
      cdView.setUint32(0, 0x02014b50, true);
      cdView.setUint16(4, 20, true);
      cdView.setUint16(6, 20, true);
      cdView.setUint16(8, 0, true);
      cdView.setUint16(10, 0, true);
      cdView.setUint16(12, 0, true);
      cdView.setUint16(14, 0, true);
      cdView.setUint32(16, crc, true);
      cdView.setUint32(20, size, true);
      cdView.setUint32(24, size, true);
      cdView.setUint16(28, nameBytes.length, true);
      cdView.setUint16(30, 0, true);
      cdView.setUint16(32, 0, true);
      cdView.setUint16(34, 0, true);
      cdView.setUint16(36, 0, true);
      cdView.setUint32(38, 0, true);
      cdView.setUint32(42, offset, true);
      cd.set(nameBytes, 46);

      localHeaders.push(lh, file.data);
      cdHeaders.push(cd);
      offset += lh.length + file.data.length;
    }

    const cdOffset = offset;
    let cdSize = 0;
    for (const cd of cdHeaders) cdSize += cd.length;

    const eocd = new Uint8Array(22);
    const eocdView = new DataView(eocd.buffer);
    eocdView.setUint32(0, 0x06054b50, true);
    eocdView.setUint16(4, 0, true);
    eocdView.setUint16(6, 0, true);
    eocdView.setUint16(8, this.files.length, true);
    eocdView.setUint16(10, this.files.length, true);
    eocdView.setUint32(12, cdSize, true);
    eocdView.setUint32(16, cdOffset, true);
    eocdView.setUint16(20, 0, true);

    const parts = [...localHeaders, ...cdHeaders, eocd];
    return new Blob(parts, { type: 'application/zip' });
  }
}

// Translation Dictionary
const translations = {
  en: {
    title: "QW Poly - Credentials",
    heading: "Connect Polygon Account",
    subtitle: "Authenticate using your API keys. Credentials are stored securely in your browser's local storage and never sent to external servers.",
    apiKeyLabel: "API Key (key)",
    apiSecretLabel: "API Secret (secret)",
    polyUsernameLabel: "Polygon Username (Optional)",
    polyPasswordLabel: "Polygon Password (Optional)",
    submitBtnText: "Verify & Connect",
    connectingBtnText: "Connecting...",
    successMessage: (count) => `Success! Connected to Polygon. Found ${count} problems.`,
    authFailedMessage: (comment) => `Authentication Failed: ${comment}`,
    connectionFailedMessage: (msg) => `Failed to connect: ${msg}`,
    infoText: "Your data is stored strictly inside your local browser storage.",
    fillRequiredFields: "Please fill in both API Key and API Secret fields.",
    langLabel: "EN",
    logoSuffix: "Poly",

    // Dashboard translations
    dashTitle: "Problems List",
    dashSubtitle: "Manage your Polygon problems.",
    newProblemBtn: "New Problem",
    thId: "ID",
    thName: "Name",
    thOwner: "Owner",
    thRevision: "Revision",
    thAccess: "Access",
    thModified: "Modified",
    thActions: "Actions",
    loadingProblems: "Loading problems...",
    noProblems: "No problems found on this account.",
    actionNotImplemented: "This action is a placeholder and not implemented yet.",
    yes: "Yes",
    no: "No",
    btnEdit: "Edit",
    btnDelete: "Delete",
    btnOpen: "Open",

    // Step 1 Create Problem Translations
    stepTitle: "Step 1: Statement and Main Information",
    stepSubtitle: "Fill in the statement details and main settings of the problem.",
    labelTimeLimit: "Time Limit (ms)",
    labelMemoryLimit: "Memory Limit (MB)",
    labelStatementLang: "Statement Language",
    labelProbName: "Problem Name",
    labelProbSystemName: "System Name (optional)",
    labelProbLegend: "Legend",
    labelProbInputFormat: "Input Format",
    labelProbOutputFormat: "Output Format",
    labelProbNotes: "Notes",
    labelProbTutorial: "Tutorial",
    texInfoPrefix: "See Polygon's ",
    texInfoBriefManual: "brief manual",
    texInfoSuffix: " to learn about supported TeX commands.",
    previewLabel: "Live Preview",
    labelPreviewTimeLimit: "Time limit per test:",
    labelPreviewMemoryLimit: "Memory limit per test:",
    previewSectionInput: "Input",
    previewSectionOutput: "Output",
    previewSectionNotes: "Note",
    previewSectionTutorial: "Tutorial",
    btnBackToDash: "Back to Dashboard",
    btnNextStepText: "Next Step",

    // Step 2 Upload Solution Translations
    step2Title: "Step 2: Upload Correct Solution",
    step2Subtitle: "Upload the correct solution code and select the programming language.",
    labelSolLang: "Programming Language",
    optSelectLang: "Select Language",
    solDropText: "Drag & drop your solution file here or click to browse",
    labelSolCode: "Solution Code",
    aiCardTitle: "AI Solution Generator",
    aiCardSubtitle: "Generate a prompt for LLMs using the task statement.",
    btnGeneratePromptText: "Generate Prompt",
    helpTitle: "How to use:",
    helpStep1: "Fill in the task statements in Step 1 (Legend, Inputs, Outputs).",
    helpStep2: "Choose the programming language in the dropdown on the left.",
    helpStep3: "Click \"Generate Prompt\" to create a structured prompt for AI.",
    helpStep4: "Copy the prompt, paste it into ChatGPT, Claude or Gemini.",
    helpStep5: "Paste the generated code into the code field on the left.",
    promptOutputTitle: "Generated Prompt",
    btnCopyPromptText: "Copy",
    btnBackToStep1: "Back to Step 1",
    btnNextStep2Text: "Next Step",
    selectLangAlert: "Please select a programming language first.",
    promptCopiedAlert: "Prompt copied to clipboard!",
    promptTemplate: (langName, name, legend, input, output) => `Write a complete, correct solution in ${langName} for the following programming task.

Problem Name: ${name}

Legend:
${legend}

Input Format:
${input}

Output Format:
${output}

Output only the clean source code in ${langName} without any markdown formatting, explanations, or code blocks.`,

    // Step 3 Upload Tests Translations
    step3Title: "Step 3: Checker and Tests",
    step3Subtitle: "Select checker program, upload test files, and select statements tests.",
    labelCheckerSelect: "Checker Program",
    optSelectChecker: "Select Checker",
    testsDropText: "Drag & drop test files here or click to browse",
    testsListHeader: "Uploaded Tests",
    thTestName: "Test File",
    thTestSize: "Size",
    thTestStatements: "Use in Statements",
    thTestActions: "Actions",
    thActions: "Actions",
    aiTestsTitle: "AI Generator Script Builder",
    aiTestsSubtitle: "Generate a prompt for LLMs to write a test generator code.",
    btnGenerateTestsPrompt: "Generate Prompt",
    helpTestsTitle: "How to use:",
    helpTestsStep1: "Fill in the problem statement details in Step 1.",
    helpTestsStep2: "Click 'Generate Prompt' to copy generator instructions.",
    helpTestsStep3: "Paste the prompt into Claude, Gemini or ChatGPT to write a generator code.",
    helpTestsStep4: "This generator can be uploaded to Polygon to generate large tests dynamically.",
    promptTestsOutputTitle: "Generated Generator Prompt",
    btnBackToStep2: "Back to Step 2",
    btnFinishProblem: "Submit Problem",
    selectCheckerAlert: "Please select a checker first.",
    testsPromptTemplate: (name, legend, input, output) => `Write a test generator program in C++ using testlib.h for the following programming task.

Problem Name: ${name}

Legend:
${legend}

Input Format:
${input}

Output Format:
${output}

The generator should output random test cases conforming to the input format and constraints. Use standard testlib.h methods (e.g., registerGen, opt, rnd.next). Output only the clean C++ source code without any markdown formatting, explanations, or code blocks.`,

    // Step 4 Final Confirmation Translations
    step4Title: "Step 4: Final Confirmation",
    step4Subtitle: "Review all entered problem parameters before submitting to Polygon.",
    summarySectionInfoTitle: "Main Settings",
    summarySectionStatementTitle: "Statements",
    summarySectionSolutionTitle: "Correct Solution",
    summarySectionTestsTitle: "Checker & Tests",
    summaryLabelName: "Problem Name:",
    summaryLabelTime: "Time Limit (ms):",
    summaryLabelMemory: "Memory Limit (MB):",
    summaryLabelLegend: "Legend:",
    summaryLabelInput: "Input Format:",
    summaryLabelOutput: "Output Format:",
    summaryLabelSolLang: "Language:",
    summaryLabelSolCode: "Solution Code:",
    summaryLabelChecker: "Checker Program:",
    summaryLabelTestsCount: "Uploaded Tests:",
    thSumTestName: "Test File",
    thSumTestSize: "Size",
    thSumTestStatements: "Statements",
    btnBackToStep3: "Back to Step 3",
    btnConfirmUploadText: "Confirm & Upload",
    progressHeaderTitleUploading: "Uploading to Polygon...",
    progressHeaderTitleSuccess: "Upload Successful!",
    progressHeaderTitleFailed: "Upload Failed",
    logStarting: "Initializing task creation pipeline...",
    logCreatingProblem: (name) => `Creating empty problem "${name}"...`,
    logProblemCreated: (id) => `Problem created successfully with ID: ${id}`,
    logUpdatingInfo: "Updating time and memory limits...",
    logInfoUpdated: "Limits configured successfully.",
    logSavingStatement: (lang) => `Uploading statements in ${lang}...`,
    logStatementSaved: "Statements saved successfully.",
    logSavingSolution: "Uploading correct solution code...",
    logSolutionSaved: "Correct solution saved as Main (MA).",
    logSettingChecker: (checker) => `Configuring checker to ${checker}...`,
    logCheckerSet: "Checker configured successfully.",
    logUploadingTests: (count) => `Found ${count} test files to upload.`,
    logUploadingTestFile: (name, idx) => `[${idx}] Uploading test file "${name}"...`,
    logTestFileUploaded: (name, idx) => `[${idx}] Test "${name}" uploaded successfully.`,
    logCommitting: "Committing problem changes...",
    logCommitted: "Changes committed successfully.",
    logUploadFinished: "All tasks completed successfully! Problem is ready on Polygon.",
    logError: (msg) => `Error: ${msg}`,
    uploadConfirmAlert: "Are you sure you want to upload this problem to Polygon?",
    btnExportTricky: "Export for QW_Tricky",
    qwtModalTitle: "Export Task for QW_Tricky",
    qwtModalSubtitle: "Configure the task parameters before generating for QW_Tricky.",
    lblQwtTaskId: "Task Folder Name (ID)",
    lblQwtTaskTitle: "Task Display Title",
    lblQwtTimeLimit: "Time Limit (ms)",
    lblQwtMemoryLimit: "Memory Limit (MB)",
    lblQwtSummaryHeading: "Task Contents Summary",
    lblQwtNoticeText: "Main test files in tests/ will contain inputs only (cheat protection protocol).",
    lblQwtSaveFolder: "Save to Folder on PC",
    lblQwtDownloadZip: "Download ZIP Archive"
  },
  ru: {
    title: "QW Poly - Доступ",
    heading: "Подключение к Polygon",
    subtitle: "Авторизуйтесь с помощью API ключей. Учетные данные хранятся локально в вашем браузере и не передаются на сторонние серверы.",
    apiKeyLabel: "API Ключ (key)",
    apiSecretLabel: "API Секрет (secret)",
    polyUsernameLabel: "Имя пользователя Polygon (опционально)",
    polyPasswordLabel: "Пароль Polygon (опционально)",
    submitBtnText: "Проверить и подключить",
    connectingBtnText: "Подключение...",
    successMessage: (count) => `Успешно! Подключено к Polygon. Найдено задач: ${count}.`,
    authFailedMessage: (comment) => `Ошибка авторизации: ${comment}`,
    connectionFailedMessage: (msg) => `Не удалось подключиться: ${msg}`,
    infoText: "Ваши данные хранятся исключительно в локальном хранилище браузера.",
    fillRequiredFields: "Пожалуйста, заполните поля API Ключ и API Секрет.",
    langLabel: "RU",
    logoSuffix: "Poly",

    // Dashboard translations
    dashTitle: "Список задач",
    dashSubtitle: "Управление задачами в Polygon.",
    newProblemBtn: "Новая задача",
    thId: "ID",
    thName: "Название",
    thOwner: "Владелец",
    thRevision: "Ревизия",
    thAccess: "Доступ",
    thModified: "Изменено",
    thActions: "Действия",
    loadingProblems: "Загрузка задач...",
    noProblems: "Задач на данном аккаунте не найдено.",
    actionNotImplemented: "Это действие-пустышка и пока не реализовано.",
    yes: "Да",
    no: "Нет",
    btnEdit: "Редактировать",
    btnDelete: "Удалить",
    btnOpen: "Открыть",

    // Step 1 Create Problem Translations
    stepTitle: "Шаг 1: Условие и основная информация",
    stepSubtitle: "Заполните условие и основные настройки создаваемой задачи.",
    labelTimeLimit: "Ограничение по времени (мс)",
    labelMemoryLimit: "Ограничение по памяти (МБ)",
    labelStatementLang: "Язык условия",
    labelProbName: "Название задачи",
    labelProbSystemName: "Системное имя (опционально)",
    labelProbLegend: "Легенда / Условие",
    labelProbInputFormat: "Формат входных данных",
    labelProbOutputFormat: "Формат выходных данных",
    labelProbNotes: "Примечания",
    labelProbTutorial: "Разбор / Описание решения",
    texInfoPrefix: "Обратитесь к",
    texInfoBriefManual: "краткому руководству",
    texInfoSuffix: " от Polygon для ознакомления с поддерживаемыми командами TeX.",
    previewLabel: "Предпросмотр",
    labelPreviewTimeLimit: "Ограничение времени на тест:",
    labelPreviewMemoryLimit: "Ограничение памяти на тест:",
    previewSectionInput: "Входные данные",
    previewSectionOutput: "Выходные данные",
    previewSectionNotes: "Примечание",
    previewSectionTutorial: "Разбор",
    btnBackToDash: "Назад в панель",
    btnNextStepText: "Следующий шаг",

    // Step 2 Upload Solution Translations
    step2Title: "Шаг 2: Загрузка эталонного решения",
    step2Subtitle: "Загрузите код эталонного решения и выберите язык программирования.",
    labelSolLang: "Язык программирования",
    optSelectLang: "Выберите язык",
    solDropText: "Перетащите файл с решением сюда или нажмите для выбора",
    labelSolCode: "Код решения",
    aiCardTitle: "ИИ Генератор Решения",
    aiCardSubtitle: "Создайте промпт для нейросетей на основе условия задачи.",
    btnGeneratePromptText: "Сгенерировать промпт",
    helpTitle: "Инструкция по использованию:",
    helpStep1: "Заполните условие задачи на Шаге 1 (Легенда, Входные и Выходные данные).",
    helpStep2: "Выберите язык программирования в выпадающем списке слева.",
    helpStep3: "Нажмите кнопку «Сгенерировать промпт» для составления запроса.",
    helpStep4: "Скопируйте промпт и вставьте его в ChatGPT, Claude или Gemini.",
    helpStep5: "Вставьте сгенерированный код в текстовое поле слева.",
    promptOutputTitle: "Сгенерированный промпт",
    btnCopyPromptText: "Копировать",
    btnBackToStep1: "Назад к Шагу 1",
    btnNextStep2Text: "Следующий шаг",
    selectLangAlert: "Пожалуйста, сначала выберите язык программирования.",
    promptCopiedAlert: "Промпт скопирован в буфер обмена!",
    promptTemplate: (langName, name, legend, input, output) => `Напиши полное и правильное решение на языке ${langName} для следующей задачи.

Название задачи: ${name}

Условие задачи / Легенда:
${legend}

Формат входных данных:
${input}

Формат выходных данных:
${output}

Выведи только чистый исходный код на языке ${langName} без какого-либо форматирования markdown (без блоков \`\`\`), пояснений или комментариев.`,

    // Step 3 Upload Tests Translations
    step3Title: "Шаг 3: Чекер и тесты",
    step3Subtitle: "Выберите программу-чекер, загрузите тесты и настройте их отображение в условии.",
    labelCheckerSelect: "Программа-чекер",
    optSelectChecker: "Выберите чекер",
    testsDropText: "Перетащите файлы тестов сюда или нажмите для выбора",
    testsListHeader: "Загруженные тесты",
    thTestName: "Файл теста",
    thTestSize: "Размер",
    thTestStatements: "Показывать в условии",
    thTestActions: "Действия",
    thActions: "Действия",
    aiTestsTitle: "ИИ Генератор Тестов",
    aiTestsSubtitle: "Создайте промпт для нейросетей для написания генератора тестов.",
    btnGenerateTestsPrompt: "Сгенерировать промпт",
    helpTestsTitle: "Инструкция по использованию:",
    helpTestsStep1: "Заполните условие задачи на Шаге 1.",
    helpTestsStep2: "Нажмите кнопку «Сгенерировать промпт» для копирования инструкции генератора.",
    helpTestsStep3: "Вставьте промпт в Claude, Gemini или ChatGPT для написания генератора тестов.",
    helpTestsStep4: "Этот генератор может быть загружен в Polygon для динамического создания тестов.",
    promptTestsOutputTitle: "Сгенерированный промпт генератора",
    btnBackToStep2: "Назад к Шагу 2",
    btnFinishProblem: "Создать задачу",
    selectCheckerAlert: "Пожалуйста, сначала выберите чекер.",
    testsPromptTemplate: (name, legend, input, output) => `Напиши программу-генератор тестов на C++ с использованием библиотеки testlib.h для следующей задачи.

Название задачи: ${name}

Условие задачи / Легенда:
${legend}

Формат входных данных:
${input}

Формат выходных данных:
${output}

Генератор должен выводить случайные тест-кейсы, соответствующие ограничениям во входных данных. Используй стандартные методы testlib.h (например, registerGen, opt, rnd.next). Выведи только чистый исходный код на C++ без какого-либо форматирования markdown (без блоков \`\`\`), пояснений или комментариев.`,

    // Step 4 Final Confirmation Translations
    step4Title: "Шаг 4: Подтверждение",
    step4Subtitle: "Проверьте все введенные параметры задачи перед отправкой в Polygon.",
    summarySectionInfoTitle: "Основные настройки",
    summarySectionStatementTitle: "Условие задачи",
    summarySectionSolutionTitle: "Эталонное решение",
    summarySectionTestsTitle: "Чекер и тесты",
    summaryLabelName: "Название задачи:",
    summaryLabelTime: "Ограничение по времени (мс):",
    summaryLabelMemory: "Ограничение по памяти (МБ):",
    summaryLabelLegend: "Легенда / Условие:",
    summaryLabelInput: "Формат входных данных:",
    summaryLabelOutput: "Формат выходных данных:",
    summaryLabelSolLang: "Язык программирования:",
    summaryLabelSolCode: "Код решения:",
    summaryLabelChecker: "Программа-чекер:",
    summaryLabelTestsCount: "Загружено тестов:",
    thSumTestName: "Файл теста",
    thSumTestSize: "Размер",
    thSumTestStatements: "В условии",
    btnBackToStep3: "Назад к Шагу 3",
    btnConfirmUploadText: "Подтвердить и загрузить",
    progressHeaderTitleUploading: "Загрузка в Polygon...",
    progressHeaderTitleSuccess: "Загрузка успешно завершена!",
    progressHeaderTitleFailed: "Ошибка загрузки",
    logStarting: "Инициализация процесса создания задачи...",
    logCreatingProblem: (name) => `Создание пустой задачи "${name}"...`,
    logProblemCreated: (id) => `Задача успешно создана. ID: ${id}`,
    logUpdatingInfo: "Настройка ограничений времени и памяти...",
    logInfoUpdated: "Ограничения успешно сохранены.",
    logSavingStatement: (lang) => `Загрузка условий задачи (язык: ${lang})...`,
    logStatementSaved: "Условие задачи успешно сохранено.",
    logSavingSolution: "Загрузка кода эталонного решения...",
    logSolutionSaved: "Решение сохранено как основное (MA).",
    logSettingChecker: (checker) => `Настройка программы-чекера (${checker})...`,
    logCheckerSet: "Чекер успешно настроен.",
    logUploadingTests: (count) => `Найдено файлов тестов для загрузки: ${count}.`,
    logUploadingTestFile: (name, idx) => `[${idx}] Загрузка файла теста "${name}"...`,
    logTestFileUploaded: (name, idx) => `[${idx}] Тест "${name}" успешно загружен.`,
    logCommitting: "Фиксация изменений в репозитории Polygon...",
    logCommitted: "Изменения успешно зафиксированы.",
    logUploadFinished: "Процесс завершен! Задача готова на платформе Polygon.",
    logError: (msg) => `Ошибка: ${msg}`,
    uploadConfirmAlert: "Вы уверены, что хотите загрузить эту задачу в Polygon?",
    btnExportTricky: "Экспорт для QW_Tricky",
    qwtModalTitle: "Экспорт задачи для QW_Tricky",
    qwtModalSubtitle: "Настройте параметры задачи перед генерацией пакета для QW_Tricky.",
    lblQwtTaskId: "Имя папки задачи (ID)",
    lblQwtTaskTitle: "Отображаемое название задачи",
    lblQwtTimeLimit: "Лимит времени (мс)",
    lblQwtMemoryLimit: "Лимит памяти (МБ)",
    lblQwtSummaryHeading: "Содержимое задачи",
    lblQwtNoticeText: "Файлы основных тестов в папке tests/ будут содержать только входные данные (протокол защиты от списывания).",
    lblQwtSaveFolder: "Сохранить в папку на ПК",
    lblQwtDownloadZip: "Скачать ZIP-архив"
  }
};

// Global Variables
let currentLang = localStorage.getItem('lang') || 'en';
let loadedProblems = [];


const themeToggleBtn = document.getElementById('theme-toggle');
const themeIcon = document.getElementById('theme-icon');

const langToggleBtn = document.getElementById('lang-toggle');
const langLabel = document.getElementById('lang-label');
const logoSuffix = document.getElementById('logo-suffix');
const authTitle = document.getElementById('auth-title');
const authSubtitle = document.getElementById('auth-subtitle');
const labelApiKey = document.getElementById('label-api-key');
const labelApiSecret = document.getElementById('label-api-secret');
const labelUsername = document.getElementById('label-poly-username');
const labelPassword = document.getElementById('label-poly-password');
const safetyText = document.getElementById('safety-text');
const submitBtnTextNode = document.getElementById('btn-text');

const dashTitle = document.getElementById('dash-title');
const dashSubtitle = document.getElementById('dash-subtitle');
const createProbBtnText = document.getElementById('dash-new-problem-btn');
const thId = document.getElementById('th-id');
const thName = document.getElementById('th-name');
const thOwner = document.getElementById('th-owner');
const thRevision = document.getElementById('th-revision');
const thAccess = document.getElementById('th-access');
const thModified = document.getElementById('th-modified');
const thActions = document.getElementById('th-actions');
const loadingProblemsText = document.getElementById('loading-problems-text');
const noProblemsText = document.getElementById('no-problems-text');

const stepTitle = document.getElementById('step-title');
const stepSubtitle = document.getElementById('step-subtitle');
const labelTimeLimit = document.getElementById('label-time-limit');
const labelMemoryLimit = document.getElementById('label-memory-limit');
const labelProbName = document.getElementById('label-prob-name');
const labelProbSystemName = document.getElementById('label-prob-system-name');
const labelStatementLang = document.getElementById('label-statement-lang');
const labelProbLegend = document.getElementById('label-prob-legend');
const labelProbInputFormat = document.getElementById('label-prob-input-format');
const labelProbOutputFormat = document.getElementById('label-prob-output-format');
const labelProbNotes = document.getElementById('label-prob-notes');
const labelProbTutorial = document.getElementById('label-prob-tutorial');

const texInfoPrefix = document.getElementById('tex-info-prefix');
const texInfoSuffix = document.getElementById('tex-info-suffix');
const previewLabel = document.getElementById('preview-label');
const labelPreviewTimeLimit = document.getElementById('label-preview-time-limit');
const labelPreviewMemoryLimit = document.getElementById('label-preview-memory-limit');
const previewSectionInput = document.getElementById('preview-section-input');
const previewSectionOutput = document.getElementById('preview-section-output');
const previewSectionNotes = document.getElementById('preview-section-notes');
const previewSectionTutorial = document.getElementById('preview-section-tutorial');
const btnBackToDashText = document.getElementById('btn-back-to-dash');
const btnNextStepTextNode = document.getElementById('btn-next-step-text');

const submitBtn = document.getElementById('submit-btn');
const createProbBtn = document.getElementById('create-prob-btn');
const form = document.getElementById('credentials-form');
const apiKeyInput = document.getElementById('api-key');
const apiSecretInput = document.getElementById('api-secret');
const usernameInput = document.getElementById('poly-username');
const passwordInput = document.getElementById('poly-password');

const statusAlert = document.getElementById('status-alert');
const alertMessage = document.getElementById('alert-message');
const iconSuccess = document.getElementById('alert-icon-success');
const iconError = document.getElementById('alert-icon-error');

const authView = document.getElementById('auth-view');
const dashboardView = document.getElementById('dashboard-view');
const createProblemView = document.getElementById('create-problem-view');
const uploadSolutionView = document.getElementById('upload-solution-view');

const problemsTableBody = document.getElementById('problems-table-body');
const tableEmptyState = document.getElementById('table-empty');

const step2Title = document.getElementById('step2-title');
const step2Subtitle = document.getElementById('step2-subtitle');
const labelSolLang = document.getElementById('label-sol-lang');
const optSelectLang = document.getElementById('opt-select-lang');
const solDropText = document.getElementById('sol-drop-text');
const labelSolCode = document.getElementById('label-sol-code');
const aiCardTitle = document.getElementById('ai-card-title');
const aiCardSubtitle = document.getElementById('ai-card-subtitle');
const btnGeneratePromptText = document.getElementById('btn-generate-prompt-text');
const helpTitle = document.getElementById('help-title');
const helpSteps = document.getElementById('help-steps');
const promptOutputTitle = document.getElementById('prompt-output-title');
const btnCopyPromptText = document.getElementById('btn-copy-prompt-text');
const btnBackToStep1Text = document.getElementById('btn-back-to-step1');
const btnNextStep2TextNode = document.getElementById('btn-next-step-2-text');

const solLangSelect = document.getElementById('sol-lang');
const solDropZone = document.getElementById('sol-drop-zone');
const solFileInput = document.getElementById('sol-file-input');
const solCodeTextarea = document.getElementById('sol-code');
const generatePromptBtn = document.getElementById('generate-prompt-btn');
const copyPromptBtn = document.getElementById('copy-prompt-btn');
const promptOutputContainer = document.getElementById('prompt-output-container');
const promptOutputText = document.getElementById('prompt-output-text');
const backToStep1Btn = document.getElementById('back-to-step1-btn');
const nextStep2Btn = document.getElementById('next-step-2-btn');

const accordionToggleBtn = document.getElementById('accordion-toggle-btn');
const accordionContent = document.getElementById('accordion-content');

const checkerTestsView = document.getElementById('checker-tests-view');
const step3Title = document.getElementById('step3-title');
const step3Subtitle = document.getElementById('step3-subtitle');
const labelCheckerSelect = document.getElementById('label-checker-select');
const optSelectChecker = document.getElementById('opt-select-checker');
const testsDropText = document.getElementById('tests-drop-text');
const testsListHeader = document.getElementById('tests-list-header');
const thTestName = document.getElementById('th-test-name');
const thTestSize = document.getElementById('th-test-size');
const thTestStatements = document.getElementById('th-test-statements');
const thTestActions = document.getElementById('th-test-actions');
const customModalOverlay = document.getElementById('custom-modal-overlay');
const customModalTitle = document.getElementById('custom-modal-title');
const customModalMessage = document.getElementById('custom-modal-message');
const customModalOkBtn = document.getElementById('custom-modal-ok-btn');
const customModalCancelBtn = document.getElementById('custom-modal-cancel-btn');
const aiTestsTitle = document.getElementById('ai-tests-title');
const aiTestsSubtitle = document.getElementById('ai-tests-subtitle');
const btnGenerateTestsPromptText = document.getElementById('btn-generate-tests-prompt-text');
const helpTestsTitle = document.getElementById('help-tests-title');
const helpTestsSteps = document.getElementById('help-tests-steps');
const promptTestsOutputTitle = document.getElementById('prompt-tests-output-title');
const btnCopyTestsPromptText = document.getElementById('btn-copy-tests-prompt-text');
const btnBackToStep2Text = document.getElementById('btn-back-to-step2');
const btnFinishProblemText = document.getElementById('btn-finish-problem-text');

const checkerSelect = document.getElementById('checker-select');
const testsDropZone = document.getElementById('tests-drop-zone');
const testsFileInput = document.getElementById('tests-file-input');
const testsListContainer = document.getElementById('tests-list-container');
const testsTableBody = document.getElementById('tests-table-body');
const generateTestsPromptBtn = document.getElementById('generate-tests-prompt-btn');
const copyTestsPromptBtn = document.getElementById('copy-tests-prompt-btn');
const testsPromptOutputContainer = document.getElementById('tests-prompt-output-container');
const testsPromptOutputText = document.getElementById('tests-prompt-output-text');
const backToStep2Btn = document.getElementById('back-to-step2-btn');
const finishProblemBtn = document.getElementById('finish-problem-btn');

const accordionTestsToggleBtn = document.getElementById('accordion-tests-toggle-btn');
const accordionTestsContent = document.getElementById('accordion-tests-content');

const confirmationView = document.getElementById('confirmation-view');
const step4Title = document.getElementById('step4-title');
const step4Subtitle = document.getElementById('step4-subtitle');
const summarySectionInfoTitle = document.getElementById('summary-section-info-title');
const summarySectionStatementTitle = document.getElementById('summary-section-statement-title');
const summarySectionSolutionTitle = document.getElementById('summary-section-solution-title');
const summarySectionTestsTitle = document.getElementById('summary-section-tests-title');
const summaryLabelName = document.getElementById('summary-label-name');
const summaryLabelTime = document.getElementById('summary-label-time');
const summaryLabelMemory = document.getElementById('summary-label-memory');
const summaryLabelLegend = document.getElementById('summary-label-legend');
const summaryLabelInput = document.getElementById('summary-label-input');
const summaryLabelOutput = document.getElementById('summary-label-output');
const summaryLabelSolLang = document.getElementById('summary-label-sol-lang');
const summaryLabelSolCode = document.getElementById('summary-label-sol-code');
const summaryLabelChecker = document.getElementById('summary-label-checker');
const summaryLabelTestsCount = document.getElementById('summary-label-tests-count');
const thSumTestName = document.getElementById('th-sum-test-name');
const thSumTestSize = document.getElementById('th-sum-test-size');
const thSumTestStatements = document.getElementById('th-sum-test-statements');
const btnBackToStep3Text = document.getElementById('btn-back-to-step3');
const btnConfirmUploadText = document.getElementById('btn-confirm-upload-text');

const summaryValName = document.getElementById('summary-val-name');
const summaryValTime = document.getElementById('summary-val-time');
const summaryValMemory = document.getElementById('summary-val-memory');
const summaryValLegend = document.getElementById('summary-val-legend');
const summaryValInput = document.getElementById('summary-val-input');
const summaryValOutput = document.getElementById('summary-val-output');
const summaryValSolLang = document.getElementById('summary-val-sol-lang');
const summaryValSolCode = document.getElementById('summary-val-sol-code');
const summaryValChecker = document.getElementById('summary-val-checker');
const summaryValTestsCount = document.getElementById('summary-val-tests-count');
const summaryTestsTableBody = document.getElementById('summary-tests-table-body');
const uploadProgressContainer = document.getElementById('upload-progress-container');
const progressHeaderTitle = document.getElementById('progress-header-title');
const progressSpinner = document.getElementById('progress-spinner');
const uploadProgressBar = document.getElementById('upload-progress-bar');
const uploadLogList = document.getElementById('upload-log-list');
const backToStep3Btn = document.getElementById('back-to-step3-btn');
const confirmUploadBtn = document.getElementById('confirm-upload-btn');
const exportTrickyBtn = document.getElementById('export-tricky-btn');
const btnExportTrickyText = document.getElementById('btn-export-tricky-text');

// QW_Tricky Export Modal Elements
const qwtExportModal = document.getElementById('qwt-export-modal');
const qwtModalTitle = document.getElementById('qwt-modal-title');
const qwtModalSubtitle = document.getElementById('qwt-modal-subtitle');
const qwtModalClose = document.getElementById('qwt-modal-close');
const qwtTaskIdInput = document.getElementById('qwt-task-id');
const qwtTaskTitleInput = document.getElementById('qwt-task-title');
const qwtTimeLimitInput = document.getElementById('qwt-time-limit');
const qwtMemoryLimitInput = document.getElementById('qwt-memory-limit');
const lblQwtTaskId = document.getElementById('lbl-qwt-task-id');
const lblQwtTaskTitle = document.getElementById('lbl-qwt-task-title');
const lblQwtTimeLimit = document.getElementById('lbl-qwt-time-limit');
const lblQwtMemoryLimit = document.getElementById('lbl-qwt-memory-limit');
const lblQwtSummaryHeading = document.getElementById('lbl-qwt-summary-heading');
const qwtSummaryText = document.getElementById('qwt-summary-text');
const lblQwtNoticeText = document.getElementById('lbl-qwt-notice-text');
const qwtSaveFolderBtn = document.getElementById('qwt-save-folder-btn');
const qwtDownloadZipBtn = document.getElementById('qwt-download-zip-btn');
const lblQwtSaveFolder = document.getElementById('lbl-qwt-save-folder');
const lblQwtDownloadZip = document.getElementById('lbl-qwt-download-zip');

// Utility function to generate a 6-character random string for Polygon apiSig
function generateRand() {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Compute SHA-512 hash using native browser Web Crypto API
async function sha512(message) {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-512', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

// Transliterate Russian/Cyrillic to Latin and format as valid Polygon system name
function toSystemName(name) {
  const cyrillicToLatin = {
    'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo', 'ж': 'zh',
    'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o',
    'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u', 'ф': 'f', 'х': 'kh', 'ц': 'ts',
    'ч': 'ch', 'ш': 'sh', 'щ': 'sch', 'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu',
    'я': 'ya',
    'А': 'a', 'Б': 'b', 'В': 'v', 'Г': 'g', 'Д': 'd', 'Е': 'e', 'Ё': 'yo', 'Ж': 'zh',
    'З': 'z', 'И': 'i', 'Й': 'y', 'К': 'k', 'Л': 'l', 'М': 'm', 'Н': 'n', 'О': 'o',
    'П': 'p', 'Р': 'r', 'С': 's', 'Т': 't', 'У': 'u', 'Ф': 'f', 'Х': 'kh', 'Ц': 'ts',
    'Ч': 'ch', 'Ш': 'sh', 'Щ': 'sch', 'Ъ': '', 'Ы': 'y', 'Ь': '', 'Э': 'e', 'Ю': 'yu',
    'Я': 'ya'
  };

  let res = "";
  for (let i = 0; i < name.length; i++) {
    const char = name[i];
    if (cyrillicToLatin[char] !== undefined) {
      res += cyrillicToLatin[char];
    } else {
      res += char;
    }
  }

  // Convert to lowercase, replace spaces and special chars with dashes
  res = res.toLowerCase()
    .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric chars with dashes
    .replace(/^-+|-+$/g, '');   // Trim leading/trailing dashes

  // Ensure it starts with a letter, prepend 'p-' if not
  if (res.length === 0) {
    res = "problem";
  } else if (!/^[a-z]/.test(res)) {
    res = "p-" + res;
  }

  return res;
}

// Call Polygon API via proxy
async function callPolygonApi(methodName, params, apiKey, apiSecret) {
  const rand = generateRand();
  const time = Math.floor(Date.now() / 1000).toString();

  // Clone parameters and add auth fields
  const fullParams = { ...params, apiKey, time };

  // Sort parameters lexicographically by key, and then by value
  const sortedKeys = Object.keys(fullParams).sort();
  const sortedParamsList = [];

  for (const key of sortedKeys) {
    const val = fullParams[key];
    if (Array.isArray(val)) {
      const sortedVals = [...val].sort();
      for (const v of sortedVals) {
        sortedParamsList.push(`${key}=${v}`);
      }
    } else {
      sortedParamsList.push(`${key}=${val}`);
    }
  }

  const queryString = sortedParamsList.join('&');

  // Generate apiSig: rand + SHA-512(rand/methodName?query#secret)
  const signatureText = `${rand}/${methodName}?${queryString}#${apiSecret}`;
  const hash = await sha512(signatureText);
  const apiSig = rand + hash;

  // Construct body as application/x-www-form-urlencoded
  const bodyParams = new URLSearchParams();
  for (const key of sortedKeys) {
    const val = fullParams[key];
    if (Array.isArray(val)) {
      for (const v of val) {
        bodyParams.append(key, v);
      }
    } else {
      bodyParams.append(key, val);
    }
  }
  bodyParams.append('apiSig', apiSig);

  const response = await fetch(`/api/${methodName}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: bodyParams
  });

  let data;
  try {
    data = await response.json();
  } catch (err) {
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    throw new Error('Failed to parse API response as JSON');
  }

  if (data.status === 'FAILED') {
    throw new Error(data.comment || 'API request failed');
  }

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status} - ${data.comment || 'Unknown error'}`);
  }

  return data;
}

// ============================================================================
// Theme Management
// ============================================================================

function getTheme() {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) return savedTheme;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);
  updateThemeIcon(theme);
}

function updateThemeIcon(theme) {
  if (!themeIcon) return;
  if (theme === 'dark') {
    themeIcon.innerHTML = `
      <circle cx="12" cy="12" r="5"></circle>
      <line x1="12" y1="1" x2="12" y2="3"></line>
      <line x1="12" y1="21" x2="12" y2="23"></line>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
      <line x1="1" y1="12" x2="3" y2="12"></line>
      <line x1="21" y1="12" x2="23" y2="12"></line>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
    `;
  } else {
    themeIcon.innerHTML = `
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
    `;
  }
}

if (themeToggleBtn) {
  themeToggleBtn.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    applyTheme(newTheme);
  });
}

// Setup Initial Theme
applyTheme(getTheme());

// ============================================================================
// Language Management
// ============================================================================

function applyLanguage(lang) {
  currentLang = lang;
  localStorage.setItem('lang', lang);

  const t = translations[lang];

  document.title = t.title;
  if (logoSuffix) logoSuffix.textContent = t.logoSuffix;

  // Auth View Translate
  if (authTitle) authTitle.textContent = t.heading;
  if (authSubtitle) authSubtitle.textContent = t.subtitle;
  if (labelApiKey) labelApiKey.textContent = t.apiKeyLabel;
  if (labelApiSecret) labelApiSecret.textContent = t.apiSecretLabel;
  if (labelUsername) labelUsername.textContent = t.polyUsernameLabel;
  if (labelPassword) labelPassword.textContent = t.polyPasswordLabel;
  if (safetyText) safetyText.textContent = t.infoText;

  if (submitBtnTextNode) {
    if (submitBtn && !submitBtn.classList.contains('loading')) {
      submitBtnTextNode.textContent = t.submitBtnText;
    } else {
      submitBtnTextNode.textContent = t.connectingBtnText;
    }
  }

  if (langLabel) langLabel.textContent = t.langLabel;

  // Dashboard Translate
  if (dashTitle) dashTitle.textContent = t.dashTitle;
  if (dashSubtitle) dashSubtitle.textContent = t.dashSubtitle;
  if (createProbBtnText) createProbBtnText.textContent = t.newProblemBtn;
  if (thId) thId.textContent = t.thId;
  if (thName) thName.textContent = t.thName;
  if (thOwner) thOwner.textContent = t.thOwner;
  if (thRevision) thRevision.textContent = t.thRevision;
  if (thAccess) thAccess.textContent = t.thAccess;
  if (thModified) thModified.textContent = t.thModified;
  if (thActions) thActions.textContent = t.thActions;
  if (loadingProblemsText) loadingProblemsText.textContent = t.loadingProblems;
  if (noProblemsText) noProblemsText.textContent = t.noProblems;

  // Create Problem View Translate
  if (stepTitle) stepTitle.textContent = t.stepTitle;
  if (stepSubtitle) stepSubtitle.textContent = t.stepSubtitle;
  if (labelTimeLimit) labelTimeLimit.textContent = t.labelTimeLimit;
  if (labelMemoryLimit) labelMemoryLimit.textContent = t.labelMemoryLimit;
  if (labelStatementLang) labelStatementLang.textContent = t.labelStatementLang;
  if (labelProbName) labelProbName.textContent = t.labelProbName;
  if (labelProbSystemName) labelProbSystemName.textContent = t.labelProbSystemName;
  if (labelProbLegend) labelProbLegend.textContent = t.labelProbLegend;
  if (labelProbInputFormat) labelProbInputFormat.textContent = t.labelProbInputFormat;
  if (labelProbOutputFormat) labelProbOutputFormat.textContent = t.labelProbOutputFormat;
  if (labelProbNotes) labelProbNotes.textContent = t.labelProbNotes;
  if (labelProbTutorial) labelProbTutorial.textContent = t.labelProbTutorial;

  if (texInfoPrefix) texInfoPrefix.textContent = t.texInfoPrefix;
  if (texInfoSuffix) texInfoSuffix.textContent = t.texInfoSuffix;
  if (previewLabel) previewLabel.textContent = t.previewLabel;
  if (labelPreviewTimeLimit) labelPreviewTimeLimit.textContent = t.labelPreviewTimeLimit;
  if (labelPreviewMemoryLimit) labelPreviewMemoryLimit.textContent = t.labelPreviewMemoryLimit;
  if (previewSectionInput) previewSectionInput.textContent = t.previewSectionInput;
  if (previewSectionOutput) previewSectionOutput.textContent = t.previewSectionOutput;
  if (previewSectionNotes) previewSectionNotes.textContent = t.previewSectionNotes;
  if (previewSectionTutorial) previewSectionTutorial.textContent = t.previewSectionTutorial;
  if (btnBackToDashText) btnBackToDashText.textContent = t.btnBackToDash;
  if (btnNextStepTextNode) btnNextStepTextNode.textContent = t.btnNextStepText;

  // Step 2 translations
  if (step2Title) step2Title.textContent = t.step2Title;
  if (step2Subtitle) step2Subtitle.textContent = t.step2Subtitle;
  if (labelSolLang) labelSolLang.textContent = t.labelSolLang;
  if (optSelectLang) optSelectLang.textContent = t.optSelectLang;
  if (solDropText && (!solFileInput || !solFileInput.files || solFileInput.files.length === 0)) solDropText.textContent = t.solDropText;
  if (labelSolCode) labelSolCode.textContent = t.labelSolCode;
  if (aiCardTitle) aiCardTitle.textContent = t.aiCardTitle;
  if (aiCardSubtitle) aiCardSubtitle.textContent = t.aiCardSubtitle;
  if (btnGeneratePromptText) btnGeneratePromptText.textContent = t.btnGeneratePromptText;
  if (helpTitle) helpTitle.textContent = t.helpTitle;
  if (helpSteps) {
    helpSteps.innerHTML = `
      <li>${t.helpStep1}</li>
      <li>${t.helpStep2}</li>
      <li>${t.helpStep3}</li>
      <li>${t.helpStep4}</li>
      <li>${t.helpStep5}</li>
    `;
  }
  if (promptOutputTitle) promptOutputTitle.textContent = t.promptOutputTitle;
  if (btnCopyPromptText) btnCopyPromptText.textContent = t.btnCopyPromptText;
  if (btnBackToStep1Text) btnBackToStep1Text.textContent = t.btnBackToStep1;
  if (btnNextStep2TextNode) btnNextStep2TextNode.textContent = t.btnNextStep2Text;

  // Re-generate prompt if it is currently visible
  if (promptOutputContainer && promptOutputContainer.style.display !== 'none') {
    generatePrompt();
  }

  // Step 3 translations
  if (step3Title) step3Title.textContent = t.step3Title;
  if (step3Subtitle) step3Subtitle.textContent = t.step3Subtitle;
  if (labelCheckerSelect) labelCheckerSelect.textContent = t.labelCheckerSelect;
  if (optSelectChecker) optSelectChecker.textContent = t.optSelectChecker;
  if (testsDropText && (!testsFileInput || !testsFileInput.files || testsFileInput.files.length === 0)) testsDropText.textContent = t.testsDropText;
  if (testsListHeader) testsListHeader.textContent = t.testsListHeader;
  if (thTestName) thTestName.textContent = t.thTestName;
  if (thTestSize) thTestSize.textContent = t.thTestSize;
  if (thTestStatements) thTestStatements.textContent = t.thTestStatements;
  if (thTestActions) thTestActions.textContent = t.thTestActions;
  if (aiTestsTitle) aiTestsTitle.textContent = t.aiTestsTitle;
  if (aiTestsSubtitle) aiTestsSubtitle.textContent = t.aiTestsSubtitle;
  if (btnGenerateTestsPromptText) btnGenerateTestsPromptText.textContent = t.btnGenerateTestsPrompt;
  if (helpTestsTitle) helpTestsTitle.textContent = t.helpTestsTitle;
  if (helpTestsSteps) {
    helpTestsSteps.innerHTML = `
      <li>${t.helpTestsStep1}</li>
      <li>${t.helpTestsStep2}</li>
      <li>${t.helpTestsStep3}</li>
      <li>${t.helpTestsStep4}</li>
    `;
  }
  if (promptTestsOutputTitle) promptTestsOutputTitle.textContent = t.promptTestsOutputTitle;
  if (btnCopyTestsPromptText) btnCopyTestsPromptText.textContent = t.btnCopyTestsPromptText;
  if (btnBackToStep2Text) btnBackToStep2Text.textContent = t.btnBackToStep2;
  if (btnFinishProblemText) btnFinishProblemText.textContent = t.btnFinishProblem;

  // Step 4 translations
  if (step4Title) step4Title.textContent = t.step4Title;
  if (step4Subtitle) step4Subtitle.textContent = t.step4Subtitle;
  if (summarySectionInfoTitle) summarySectionInfoTitle.textContent = t.summarySectionInfoTitle;
  if (summarySectionStatementTitle) summarySectionStatementTitle.textContent = t.summarySectionStatementTitle;
  if (summarySectionSolutionTitle) summarySectionSolutionTitle.textContent = t.summarySectionSolutionTitle;
  if (summarySectionTestsTitle) summarySectionTestsTitle.textContent = t.summarySectionTestsTitle;
  if (summaryLabelName) summaryLabelName.textContent = t.summaryLabelName;
  if (summaryLabelTime) summaryLabelTime.textContent = t.summaryLabelTime;
  if (summaryLabelMemory) summaryLabelMemory.textContent = t.summaryLabelMemory;
  if (summaryLabelLegend) summaryLabelLegend.textContent = t.summaryLabelLegend;
  if (summaryLabelInput) summaryLabelInput.textContent = t.summaryLabelInput;
  if (summaryLabelOutput) summaryLabelOutput.textContent = t.summaryLabelOutput;
  if (summaryLabelSolLang) summaryLabelSolLang.textContent = t.summaryLabelSolLang;
  if (summaryLabelSolCode) summaryLabelSolCode.textContent = t.summaryLabelSolCode;
  if (summaryLabelChecker) summaryLabelChecker.textContent = t.summaryLabelChecker;
  if (summaryLabelTestsCount) summaryLabelTestsCount.textContent = t.summaryLabelTestsCount;
  if (thSumTestName) thSumTestName.textContent = t.thSumTestName;
  if (thSumTestSize) thSumTestSize.textContent = t.thSumTestSize;
  if (thSumTestStatements) thSumTestStatements.textContent = t.thSumTestStatements;
  if (btnBackToStep3Text) btnBackToStep3Text.textContent = t.btnBackToStep3;
  if (btnConfirmUploadText) btnConfirmUploadText.textContent = t.btnConfirmUploadText;
  if (btnExportTrickyText) btnExportTrickyText.textContent = t.btnExportTricky;

  // QW_Tricky Export Modal translations
  if (qwtModalTitle) qwtModalTitle.textContent = t.qwtModalTitle;
  if (qwtModalSubtitle) qwtModalSubtitle.textContent = t.qwtModalSubtitle;
  if (lblQwtTaskId) lblQwtTaskId.textContent = t.lblQwtTaskId;
  if (lblQwtTaskTitle) lblQwtTaskTitle.textContent = t.lblQwtTaskTitle;
  if (lblQwtTimeLimit) lblQwtTimeLimit.textContent = t.lblQwtTimeLimit;
  if (lblQwtMemoryLimit) lblQwtMemoryLimit.textContent = t.lblQwtMemoryLimit;
  if (lblQwtSummaryHeading) lblQwtSummaryHeading.textContent = t.lblQwtSummaryHeading;
  if (lblQwtNoticeText) lblQwtNoticeText.textContent = t.lblQwtNoticeText;
  if (lblQwtSaveFolder) lblQwtSaveFolder.textContent = t.lblQwtSaveFolder;
  if (lblQwtDownloadZip) lblQwtDownloadZip.textContent = t.lblQwtDownloadZip;

  // Re-generate tests prompt if currently visible
  if (testsPromptOutputContainer && testsPromptOutputContainer.style.display !== 'none') {
    generateTestsPrompt();
  }

  // Re-render problems table if open to refresh translations in dynamic content
  if (loadedProblems.length > 0) {
    renderProblems(loadedProblems);
  }

  // Re-render statement preview to update labels
  if (createProblemView && createProblemView.style.display !== 'none') {
    updateStatementPreview();
  }
}

if (langToggleBtn) {
  langToggleBtn.addEventListener('click', () => {
    const newLang = currentLang === 'en' ? 'ru' : 'en';
    applyLanguage(newLang);
  });
}

// ============================================================================
// Form Interaction Handles (ripple, show/hide passwords)
// ============================================================================

// Password/Secret visibility toggles
function setupPasswordToggle(inputId, toggleId) {
  const input = document.getElementById(inputId);
  const toggle = document.getElementById(toggleId);

  if (!toggle || !input) return;

  toggle.addEventListener('click', () => {
    const isPassword = input.type === 'password';
    input.type = isPassword ? 'text' : 'password';

    toggle.innerHTML = isPassword ? `
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
        <line x1="1" y1="1" x2="23" y2="23"></line>
      </svg>
    ` : `
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
        <circle cx="12" cy="12" r="3"></circle>
      </svg>
    `;
  });
}

setupPasswordToggle('api-secret', 'secret-toggle');
setupPasswordToggle('poly-password', 'pass-toggle');

// Ripple Effect on Buttons
function applyRippleEffect(button) {
  if (!button) return;
  button.addEventListener('click', (e) => {
    const circle = document.createElement('span');
    const diameter = Math.max(button.clientWidth, button.clientHeight);
    const radius = diameter / 2;

    const rect = button.getBoundingClientRect();
    const x = e.clientX - rect.left - radius;
    const y = e.clientY - rect.top - radius;

    circle.style.width = circle.style.height = `${diameter}px`;
    circle.style.left = `${x}px`;
    circle.style.top = `${y}px`;
    circle.classList.add('ripple');

    const ripple = button.getElementsByClassName('ripple')[0];
    if (ripple) {
      ripple.remove();
    }

    button.appendChild(circle);
  });
}

applyRippleEffect(submitBtn);
applyRippleEffect(createProbBtn);
if (backToStep3Btn) applyRippleEffect(backToStep3Btn);
if (confirmUploadBtn) applyRippleEffect(confirmUploadBtn);

// ============================================================================
// Credentials Storage Handles
// ============================================================================

function loadCredentials() {
  const savedKey = localStorage.getItem('poly_api_key');
  const savedSecret = localStorage.getItem('poly_api_secret');
  const savedUsername = localStorage.getItem('poly_username');
  const savedPassword = localStorage.getItem('poly_password');

  if (savedKey && apiKeyInput) apiKeyInput.value = savedKey;
  if (savedSecret && apiSecretInput) apiSecretInput.value = savedSecret;
  if (savedUsername && usernameInput) usernameInput.value = savedUsername;
  if (savedPassword && passwordInput) passwordInput.value = savedPassword;
}

loadCredentials();

// Initialize dynamic translations
applyLanguage(currentLang);

// Alert Notification Manager
function showAlert(message, type = 'error') {
  if (!statusAlert) return;
  alertMessage.textContent = message;
  statusAlert.className = `alert show alert-${type}`;

  if (type === 'success') {
    iconSuccess.style.display = 'block';
    iconError.style.display = 'none';
  } else {
    iconSuccess.style.display = 'none';
    iconError.style.display = 'block';
  }
}

function hideAlert() {
  if (statusAlert) statusAlert.classList.remove('show');
}

// ============================================================================
// Navigation Views Transitions
// ============================================================================

function showDashboard(problems) {
  loadedProblems = problems;

  // Transition views with fade animation
  authView.style.opacity = '0';
  authView.style.transform = 'translateY(-10px)';
  authView.style.transition = 'opacity 0.3s ease, transform 0.3s ease';

  setTimeout(() => {
    authView.style.display = 'none';
    dashboardView.style.display = 'block';

    // Trigger layout transition
    setTimeout(() => {
      dashboardView.style.opacity = '1';
      dashboardView.style.transform = 'translateY(0)';
      dashboardView.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
    }, 50);

    renderProblems(problems);
  }, 300);
}

// Render dynamic problem items inside table
function renderProblems(problems) {
  if (!problemsTableBody) return;
  problemsTableBody.innerHTML = '';

  const t = translations[currentLang];

  if (problems.length === 0) {
    tableEmptyState.style.display = 'flex';
    return;
  }

  tableEmptyState.style.display = 'none';

  problems.forEach(prob => {
    const tr = document.createElement('tr');

    let badgeClass = 'badge-read';
    if (prob.accessType === 'OWNER') badgeClass = 'badge-owner';
    else if (prob.accessType === 'WRITE') badgeClass = 'badge-write';

    const isModifiedText = prob.modified ? t.yes : t.no;
    const isModifiedClass = prob.modified ? 'modified-yes' : 'modified-no';

    tr.innerHTML = `
      <td class="col-id">${prob.id}</td>
      <td class="col-name font-medium">${prob.name}</td>
      <td class="col-owner">${prob.owner}</td>
      <td class="col-rev">v${prob.revision}</td>
      <td class="col-access">
        <span class="badge ${badgeClass}">${prob.accessType}</span>
      </td>
      <td class="col-modified ${isModifiedClass}">${isModifiedText}</td>
      <td class="col-actions" style="text-align: right;">
        <button class="btn-text-action btn-export-tricky-prob" data-id="${prob.id}" style="margin-right: 8px;" title="${t.btnExportTricky}">
          QW_Tricky
        </button>
        <button class="btn-text-action btn-open-prob" data-id="${prob.id}">
          ${t.btnOpen}
        </button>
      </td>
    `;

    problemsTableBody.appendChild(tr);
  });

  // Attach event listener for Open & Export buttons
  document.querySelectorAll('.btn-open-prob').forEach(btn => {
    applyRippleEffect(btn);
    btn.addEventListener('click', (e) => {
      const probId = e.currentTarget.getAttribute('data-id');
      openExistingProblem(probId, e.currentTarget);
    });
  });

  document.querySelectorAll('.btn-export-tricky-prob').forEach(btn => {
    applyRippleEffect(btn);
    btn.addEventListener('click', async (e) => {
      const probId = e.currentTarget.getAttribute('data-id');
      await openExistingProblem(probId, e.currentTarget);
      const payload = gatherWizardTaskData();
      openQwtExportModal(payload.taskData, payload.mainTests);
    });
  });
}

// ============================================================================
// LaTeX Math Equations Parser & Live Statement Preview
// ============================================================================

function renderTex(text) {
  // Escape HTML tags to prevent breaking layout
  let escaped = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // Replace em-dash outside math
  escaped = escaped.replace(/---/g, '&mdash;');

  // Replace inline TeX math $...$
  return escaped.replace(/\$([^\$]+)\$/g, (match, formula) => {
    let html = formula;

    // Replace LaTeX operators & math elements
    html = html.replace(/\\le\b/g, '&le;');
    html = html.replace(/\\leq\b/g, '&le;');
    html = html.replace(/\\ge\b/g, '&ge;');
    html = html.replace(/\\geq\b/g, '&ge;');
    html = html.replace(/\\dots\b/g, '&hellip;');

    // Subscripts and superscripts
    html = html.replace(/\b([a-zA-Z])_([0-9a-zA-Z])/g, '<i>$1</i><sub>$2</sub>');
    html = html.replace(/\b([a-zA-Z])_\{([^\}]+)\}/g, '<i>$1</i><sub>$2</sub>');
    html = html.replace(/\b([a-zA-Z])\^([0-9a-zA-Z])/g, '<i>$1</i><sup>$2</sup>');
    html = html.replace(/\b([a-zA-Z])\^\{([^\}]+)\}/g, '<i>$1</i><sup>$2</sup>');
    html = html.replace(/([0-9]+)\^([0-9]+)/g, '$1<sup>$2</sup>');
    html = html.replace(/([0-9]+)\^\{([^\}]+)\}/g, '$1<sup>$2</sup>');

    // Absolute values |x|
    html = html.replace(/\|([^\|]+)\|/g, '|$1|');

    // Single alphabet variables in math equations rendered in italics
    html = html.replace(/\b([a-zA-Z])\b/g, '<i>$1</i>');

    return `<span class="math-expr">${html}</span>`;
  });
}

function updateStatementPreview() {
  const nameVal = document.getElementById('prob-name').value || '';
  const timeVal = document.getElementById('prob-time-limit').value || '1000';
  const memVal = document.getElementById('prob-memory-limit').value || '256';
  const legendVal = document.getElementById('prob-legend').value || '';
  const inputVal = document.getElementById('prob-input-format').value || '';
  const outputVal = document.getElementById('prob-output-format').value || '';
  const notesVal = document.getElementById('prob-notes').value || '';
  const tutorialVal = document.getElementById('prob-tutorial').value || '';

  document.getElementById('preview-title').textContent = nameVal;
  document.getElementById('preview-time-limit').textContent = `${timeVal} ms`;
  document.getElementById('preview-memory-limit').textContent = `${memVal} MB`;

  document.getElementById('preview-legend').innerHTML = renderTex(legendVal).replace(/\n/g, '<br>');
  document.getElementById('preview-input-format').innerHTML = renderTex(inputVal).replace(/\n/g, '<br>');
  document.getElementById('preview-output-format').innerHTML = renderTex(outputVal).replace(/\n/g, '<br>');

  const notesSection = document.getElementById('preview-notes-section');
  if (notesVal.trim() !== '') {
    notesSection.style.display = 'block';
    document.getElementById('preview-notes').innerHTML = renderTex(notesVal).replace(/\n/g, '<br>');
  } else {
    notesSection.style.display = 'none';
  }

  const tutorialSection = document.getElementById('preview-tutorial-section');
  if (tutorialVal.trim() !== '') {
    tutorialSection.style.display = 'block';
    document.getElementById('preview-tutorial').innerHTML = renderTex(tutorialVal).replace(/\n/g, '<br>');
  } else {
    tutorialSection.style.display = 'none';
  }
}

// Bind live statement preview typing handlers
const statementInputs = [
  'prob-name', 'prob-time-limit', 'prob-memory-limit',
  'prob-legend', 'prob-input-format', 'prob-output-format',
  'prob-notes', 'prob-tutorial'
];
statementInputs.forEach(id => {
  const el = document.getElementById(id);
  if (el) {
    el.addEventListener('input', updateStatementPreview);
  }
});

// Navigate to Create Problem View
if (createProbBtn) {
  createProbBtn.addEventListener('click', () => {
    dashboardView.style.opacity = '0';
    dashboardView.style.transform = 'translateY(-10px)';
    dashboardView.style.transition = 'opacity 0.3s ease, transform 0.3s ease';

    setTimeout(() => {
      dashboardView.style.display = 'none';
      createProblemView.style.display = 'block';

      // Reset edit mode and wizard titles
      editingProblemId = null;
      uploadedTests = [];
      updateWizardTitleForEdit();
      renderTestsTable();

      // Prefill fields with empty/default values
      document.getElementById('prob-name').value = '';
      document.getElementById('prob-system-name').value = '';
      document.getElementById('prob-statement-lang').value = 'russian';
      document.getElementById('prob-time-limit').value = '1000';
      document.getElementById('prob-memory-limit').value = '256';
      document.getElementById('prob-legend').value = '';
      document.getElementById('prob-input-format').value = '';
      document.getElementById('prob-output-format').value = '';
      document.getElementById('prob-notes').value = '';
      document.getElementById('prob-tutorial').value = '';

      updateStatementPreview();

      setTimeout(() => {
        createProblemView.style.opacity = '1';
        createProblemView.style.transform = 'translateY(0)';
        createProblemView.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
      }, 50);
    }, 300);
  });
}

// Navigate back to Dashboard View
const cancelCreateBtn = document.getElementById('cancel-create-btn');
if (cancelCreateBtn) {
  applyRippleEffect(cancelCreateBtn);
  cancelCreateBtn.addEventListener('click', () => {
    hideAllWizardViewsAndShowDashboard();
  });
}

// Next Step (transition from Step 1 to Step 2)
const nextStepBtn = document.getElementById('next-step-btn');
if (nextStepBtn) {
  applyRippleEffect(nextStepBtn);
  nextStepBtn.addEventListener('click', () => {
    // Validate Step 1 fields
    const nameVal = document.getElementById('prob-name').value.trim();
    const legendVal = document.getElementById('prob-legend').value.trim();
    const inputVal = document.getElementById('prob-input-format').value.trim();
    const outputVal = document.getElementById('prob-output-format').value.trim();

    if (!nameVal || !legendVal || !inputVal || !outputVal) {
      // Highlight invalid inputs by triggering native HTML5 validation
      const formEl = document.getElementById('problem-statement-form');
      if (formEl) {
        formEl.reportValidity();
      }
      return;
    }

    // Smooth transition
    createProblemView.style.opacity = '0';
    createProblemView.style.transform = 'translateY(-10px)';
    createProblemView.style.transition = 'opacity 0.3s ease, transform 0.3s ease';

    setTimeout(() => {
      createProblemView.style.display = 'none';
      uploadSolutionView.style.display = 'block';

      // Reset step 2 states if needed
      if (promptOutputContainer) {
        promptOutputContainer.style.display = 'none';
      }

      setTimeout(() => {
        uploadSolutionView.style.opacity = '1';
        uploadSolutionView.style.transform = 'translateY(0)';
        uploadSolutionView.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
      }, 50);
    }, 300);
  });
}

// ============================================================================
// Form Submission & API Verification
// ============================================================================

if (form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideAlert();

    const apiKey = apiKeyInput.value.trim();
    const apiSecret = apiSecretInput.value.trim();
    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();

    const t = translations[currentLang];

    if (!apiKey || !apiSecret) {
      showAlert(t.fillRequiredFields);
      return;
    }

    // Enter loading state
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;
    submitBtnTextNode.textContent = t.connectingBtnText;

    try {
      // Attempt problems.list call to verify credentials
      const responseData = await callPolygonApi('problems.list', {}, apiKey, apiSecret);

      if (responseData.status === 'OK') {
        showAlert(t.successMessage(responseData.result.length), 'success');

        // Save credentials to localStorage
        localStorage.setItem('poly_api_key', apiKey);
        localStorage.setItem('poly_api_secret', apiSecret);
        if (username) localStorage.setItem('poly_username', username);
        if (password) localStorage.setItem('poly_password', password);

        // Transition to dashboard
        setTimeout(() => {
          showDashboard(responseData.result);
        }, 1000);

      } else {
        showAlert(t.authFailedMessage(responseData.comment || 'Unknown error'));
      }
    } catch (err) {
      console.error(err);
      showAlert(t.connectionFailedMessage(err.message || 'Check your internet connection or proxy status.'));
    } finally {
      // Exit loading state
      if (submitBtn) {
        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;
        submitBtnTextNode.textContent = t.submitBtnText;
      }
    }
  });
}

// ============================================================================
// Step 2 Upload Solution View Implementation
// ============================================================================

// Back to Step 1 Transition
if (backToStep1Btn) {
  applyRippleEffect(backToStep1Btn);
  backToStep1Btn.addEventListener('click', () => {
    uploadSolutionView.style.opacity = '0';
    uploadSolutionView.style.transform = 'translateY(-10px)';
    uploadSolutionView.style.transition = 'opacity 0.3s ease, transform 0.3s ease';

    setTimeout(() => {
      uploadSolutionView.style.display = 'none';
      createProblemView.style.display = 'block';

      setTimeout(() => {
        createProblemView.style.opacity = '1';
        createProblemView.style.transform = 'translateY(0)';
        createProblemView.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
      }, 50);
    }, 300);
  });
}

// Drag & Drop event bindings
if (solDropZone) {
  solDropZone.addEventListener('click', () => solFileInput.click());

  solDropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    solDropZone.classList.add('drop-zone--over');
  });

  ['dragleave', 'dragend'].forEach(type => {
    solDropZone.addEventListener(type, () => {
      solDropZone.classList.remove('drop-zone--over');
    });
  });

  solDropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    solDropZone.classList.remove('drop-zone--over');

    if (e.dataTransfer.files.length) {
      solFileInput.files = e.dataTransfer.files;
      handleSolutionFile(e.dataTransfer.files[0]);
    }
  });
}

if (solFileInput) {
  solFileInput.addEventListener('change', () => {
    if (solFileInput.files.length) {
      handleSolutionFile(solFileInput.files[0]);
    }
  });
}

function handleSolutionFile(file) {
  const reader = new FileReader();
  reader.onload = (e) => {
    solCodeTextarea.value = e.target.result;

    // Reset selection / focus styles by triggering input event
    solCodeTextarea.dispatchEvent(new Event('input'));

    const t = translations[currentLang];
    if (solDropText) {
      solDropText.textContent = `${file.name} (${Math.round(file.size / 1024)} KB)`;
    }

    // Auto-detect language based on file extension
    const ext = file.name.split('.').pop().toLowerCase();
    let detectedLang = "";
    if (ext === 'cpp' || ext === 'h' || ext === 'hpp') detectedLang = 'cpp.g++20';
    else if (ext === 'py') detectedLang = 'python.3';
    else if (ext === 'java') detectedLang = 'java17';
    else if (ext === 'rs') detectedLang = 'rust';
    else if (ext === 'go') detectedLang = 'go';
    else if (ext === 'kt') detectedLang = 'kotlin';
    else if (ext === 'cs') detectedLang = 'csharp.dotnet';

    if (detectedLang && solLangSelect) {
      solLangSelect.value = detectedLang;
    }
  };
  reader.readAsText(file);
}

// Collapsible accordion help toggle
if (accordionToggleBtn) {
  accordionToggleBtn.addEventListener('click', () => {
    const expanded = accordionToggleBtn.getAttribute('aria-expanded') === 'true';
    accordionToggleBtn.setAttribute('aria-expanded', !expanded);

    if (!expanded) {
      accordionContent.style.maxHeight = accordionContent.scrollHeight + 'px';
    } else {
      accordionContent.style.maxHeight = '0px';
    }
  });
}

// AI Prompt Generation function (hoisted to applyLanguage above)
async function generatePrompt() {
  const t = translations[currentLang];
  if (!solLangSelect.value) {
    await showCustomAlert(t.selectLangAlert);
    return;
  }

  const langName = solLangSelect.options[solLangSelect.selectedIndex].text;
  const nameVal = document.getElementById('prob-name').value || '';
  const legendVal = document.getElementById('prob-legend').value || '';
  const inputVal = document.getElementById('prob-input-format').value || '';
  const outputVal = document.getElementById('prob-output-format').value || '';

  const promptText = t.promptTemplate(langName, nameVal, legendVal, inputVal, outputVal);
  if (promptOutputText) {
    promptOutputText.value = promptText;
  }
  if (promptOutputContainer) {
    promptOutputContainer.style.display = 'flex';
  }
}

if (generatePromptBtn) {
  applyRippleEffect(generatePromptBtn);
  generatePromptBtn.addEventListener('click', generatePrompt);
}

// Copy prompt clipboard logic
if (copyPromptBtn) {
  applyRippleEffect(copyPromptBtn);
  copyPromptBtn.addEventListener('click', () => {
    if (promptOutputText) {
      promptOutputText.select();
      navigator.clipboard.writeText(promptOutputText.value).then(async () => {
        const t = translations[currentLang];
        await showCustomAlert(t.promptCopiedAlert);
      }).catch(err => {
        console.error('Failed to copy: ', err);
      });
    }
  });
}

// Next Step 2 (transition from Step 2 to Step 3)
if (nextStep2Btn) {
  applyRippleEffect(nextStep2Btn);
  nextStep2Btn.addEventListener('click', async () => {
    // Validate Step 2 fields
    if (!solLangSelect.value) {
      await showCustomAlert(translations[currentLang].selectLangAlert);
      solLangSelect.focus();
      return;
    }
    if (!solCodeTextarea.value.trim()) {
      const msg = translations[currentLang].langLabel === 'RU' ? 'Пожалуйста, введите код решения.' : 'Please enter the solution code.';
      await showCustomAlert(msg);
      solCodeTextarea.focus();
      return;
    }

    // Smooth transition
    uploadSolutionView.style.opacity = '0';
    uploadSolutionView.style.transform = 'translateY(-10px)';
    uploadSolutionView.style.transition = 'opacity 0.3s ease, transform 0.3s ease';

    setTimeout(() => {
      uploadSolutionView.style.display = 'none';
      checkerTestsView.style.display = 'block';

      // Reset prompt state
      if (testsPromptOutputContainer) {
        testsPromptOutputContainer.style.display = 'none';
      }

      setTimeout(() => {
        checkerTestsView.style.opacity = '1';
        checkerTestsView.style.transform = 'translateY(0)';
        checkerTestsView.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
      }, 50);
    }, 300);
  });
}

// ============================================================================
// Step 3 Checker and Tests Implementation
// ============================================================================

let uploadedTests = [];

// Back to Step 2 Transition
if (backToStep2Btn) {
  applyRippleEffect(backToStep2Btn);
  backToStep2Btn.addEventListener('click', () => {
    checkerTestsView.style.opacity = '0';
    checkerTestsView.style.transform = 'translateY(-10px)';
    checkerTestsView.style.transition = 'opacity 0.3s ease, transform 0.3s ease';

    setTimeout(() => {
      checkerTestsView.style.display = 'none';
      uploadSolutionView.style.display = 'block';

      setTimeout(() => {
        uploadSolutionView.style.opacity = '1';
        uploadSolutionView.style.transform = 'translateY(0)';
        uploadSolutionView.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
      }, 50);
    }, 300);
  });
}

// Drag & Drop Tests Events
if (testsDropZone) {
  testsDropZone.addEventListener('click', () => testsFileInput.click());

  testsDropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    testsDropZone.classList.add('drop-zone--over');
  });

  ['dragleave', 'dragend'].forEach(type => {
    testsDropZone.addEventListener(type, () => {
      testsDropZone.classList.remove('drop-zone--over');
    });
  });

  testsDropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    testsDropZone.classList.remove('drop-zone--over');

    if (e.dataTransfer.files.length) {
      handleTestFiles(e.dataTransfer.files);
    }
  });
}

if (testsFileInput) {
  testsFileInput.addEventListener('change', () => {
    if (testsFileInput.files.length) {
      handleTestFiles(testsFileInput.files);
    }
  });
}

function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

function handleTestFiles(files) {
  for (let i = 0; i < files.length; i++) {
    const file = files[i];

    // Check if test file already uploaded to prevent duplicates
    if (!uploadedTests.some(t => t.name === file.name)) {
      const testObj = {
        name: file.name,
        size: file.size,
        useInStatements: false, // Default to false
        content: ""
      };
      uploadedTests.push(testObj);

      // Read text content of the test file
      const reader = new FileReader();
      reader.onload = (e) => {
        testObj.content = e.target.result;
      };
      reader.readAsText(file);
    }
  }

  // Pre-check the first test if uploadedTests length > 0 for premium UX
  setTimeout(() => {
    if (uploadedTests.length > 0 && !uploadedTests.some(t => t.useInStatements)) {
      uploadedTests[0].useInStatements = true;
    }
    renderTestsTable();
  }, 100);
}

function renderTestsTable() {
  if (!testsTableBody || !testsListContainer) return;

  if (uploadedTests.length === 0) {
    testsListContainer.style.display = 'none';
    return;
  }

  testsListContainer.style.display = 'block';
  testsTableBody.innerHTML = '';

  uploadedTests.forEach((test, idx) => {
    const tr = document.createElement('tr');
    tr.style.animation = 'fadeIn 0.2s ease';

    const checkedAttr = test.useInStatements ? 'checked' : '';

    tr.innerHTML = `
      <td class="col-name font-medium">${test.name}</td>
      <td class="col-size" style="color: var(--text-secondary);">${formatBytes(test.size)}</td>
      <td class="col-statements">
        <div class="tests-checkbox-container">
          <input type="checkbox" class="tests-checkbox" data-idx="${idx}" ${checkedAttr}>
        </div>
      </td>
      <td class="col-actions" style="text-align: right;">
        <button class="btn-text-action btn-delete-test text-red" data-idx="${idx}" style="padding: 4px 8px;">
          ${currentLang === 'en' ? 'Remove' : 'Убрать'}
        </button>
      </td>
    `;

    testsTableBody.appendChild(tr);
  });

  // Bind checkbox changes
  testsTableBody.querySelectorAll('.tests-checkbox').forEach(cb => {
    cb.addEventListener('change', (e) => {
      const idx = parseInt(e.target.getAttribute('data-idx'));
      uploadedTests[idx].useInStatements = e.target.checked;
    });
  });

  // Bind delete test buttons
  testsTableBody.querySelectorAll('.btn-delete-test').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const idx = parseInt(e.currentTarget.getAttribute('data-idx'));
      uploadedTests.splice(idx, 1);
      renderTestsTable();
    });
  });
}

// Collapsible accordion for tests generator
if (accordionTestsToggleBtn) {
  accordionTestsToggleBtn.addEventListener('click', () => {
    const expanded = accordionTestsToggleBtn.getAttribute('aria-expanded') === 'true';
    accordionTestsToggleBtn.setAttribute('aria-expanded', !expanded);

    if (!expanded) {
      accordionTestsContent.style.maxHeight = accordionTestsContent.scrollHeight + 'px';
    } else {
      accordionTestsContent.style.maxHeight = '0px';
    }
  });
}

// AI Generator Prompt function for tests
async function generateTestsPrompt() {
  const t = translations[currentLang];
  if (!checkerSelect.value) {
    await showCustomAlert(t.selectCheckerAlert);
    checkerSelect.focus();
    return;
  }

  const nameVal = document.getElementById('prob-name').value || '';
  const legendVal = document.getElementById('prob-legend').value || '';
  const inputVal = document.getElementById('prob-input-format').value || '';
  const outputVal = document.getElementById('prob-output-format').value || '';

  const promptText = t.testsPromptTemplate(nameVal, legendVal, inputVal, outputVal);
  if (testsPromptOutputText) {
    testsPromptOutputText.value = promptText;
  }
  if (testsPromptOutputContainer) {
    testsPromptOutputContainer.style.display = 'flex';
  }
}

if (generateTestsPromptBtn) {
  applyRippleEffect(generateTestsPromptBtn);
  generateTestsPromptBtn.addEventListener('click', generateTestsPrompt);
}

// Copy prompt clipboard logic for tests generator
if (copyTestsPromptBtn) {
  applyRippleEffect(copyTestsPromptBtn);
  copyTestsPromptBtn.addEventListener('click', () => {
    if (testsPromptOutputText) {
      testsPromptOutputText.select();
      navigator.clipboard.writeText(testsPromptOutputText.value).then(async () => {
        const t = translations[currentLang];
        await showCustomAlert(t.promptCopiedAlert);
      }).catch(err => {
        console.error('Failed to copy: ', err);
      });
    }
  });
}

// Submit/Finish Problem button click handler -> transition to Step 4
if (finishProblemBtn) {
  applyRippleEffect(finishProblemBtn);
  finishProblemBtn.addEventListener('click', async () => {
    // Validate Step 3 fields
    if (!checkerSelect.value) {
      await showCustomAlert(translations[currentLang].selectCheckerAlert);
      checkerSelect.focus();
      return;
    }

    // Populate the confirmation summaries dynamically
    populateConfirmationSummary();

    // Smooth transition from Step 3 to Step 4
    checkerTestsView.style.opacity = '0';
    checkerTestsView.style.transform = 'translateY(-10px)';
    checkerTestsView.style.transition = 'opacity 0.3s ease, transform 0.3s ease';

    setTimeout(() => {
      checkerTestsView.style.display = 'none';
      confirmationView.style.display = 'block';

      // Reset upload progress UI
      if (uploadProgressContainer) uploadProgressContainer.style.display = 'none';
      if (uploadLogList) uploadLogList.innerHTML = '';
      if (uploadProgressBar) uploadProgressBar.style.width = '0%';

      const t = translations[currentLang];
      if (progressHeaderTitle) progressHeaderTitle.textContent = t.progressHeaderTitleUploading;
      if (progressSpinner) progressSpinner.style.display = 'block';

      // Reset confirmation button
      confirmUploadBtn.disabled = false;
      confirmUploadBtn.innerHTML = `<span>${t.btnConfirmUploadText}</span><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>`;
      confirmUploadBtn.onclick = triggerUploadFlow;

      setTimeout(() => {
        confirmationView.style.opacity = '1';
        confirmationView.style.transform = 'translateY(0)';
        confirmationView.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
      }, 50);
    }, 300);
  });
}

// Back to Step 3 Transition
if (backToStep3Btn) {
  applyRippleEffect(backToStep3Btn);
  backToStep3Btn.addEventListener('click', () => {
    confirmationView.style.opacity = '0';
    confirmationView.style.transform = 'translateY(-10px)';
    confirmationView.style.transition = 'opacity 0.3s ease, transform 0.3s ease';

    setTimeout(() => {
      confirmationView.style.display = 'none';
      checkerTestsView.style.display = 'block';

      setTimeout(() => {
        checkerTestsView.style.opacity = '1';
        checkerTestsView.style.transform = 'translateY(0)';
        checkerTestsView.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
      }, 50);
    }, 300);
  });
}

// Helper to append log item
function addUploadLog(text, type = 'info') {
  if (!uploadLogList) return;
  const item = document.createElement('div');
  item.className = `upload-log-item ${type}`;
  let symbol = '[→]';
  if (type === 'success') symbol = '[✓]';
  if (type === 'error') symbol = '[✗]';
  if (type === 'pending') symbol = '[•]';
  item.textContent = `${symbol} ${text}`;
  uploadLogList.appendChild(item);
  uploadLogList.scrollTop = uploadLogList.scrollHeight;
}

// Populate confirmation view values
function populateConfirmationSummary() {
  const nameVal = document.getElementById('prob-name').value || '';
  const timeVal = document.getElementById('prob-time-limit').value || '';
  const memoryVal = document.getElementById('prob-memory-limit').value || '';
  const legendVal = document.getElementById('prob-legend').value || '';
  const inputVal = document.getElementById('prob-input-format').value || '';
  const outputVal = document.getElementById('prob-output-format').value || '';

  if (summaryValName) summaryValName.textContent = nameVal;
  if (summaryValTime) summaryValTime.textContent = `${timeVal} ms`;
  if (summaryValMemory) summaryValMemory.textContent = `${memoryVal} MB`;
  if (summaryValLegend) summaryValLegend.textContent = legendVal;
  if (summaryValInput) summaryValInput.textContent = inputVal;
  if (summaryValOutput) summaryValOutput.textContent = outputVal;

  if (summaryValSolLang && solLangSelect) {
    summaryValSolLang.textContent = solLangSelect.options[solLangSelect.selectedIndex].text;
  }
  if (summaryValSolCode && solCodeTextarea) {
    summaryValSolCode.textContent = solCodeTextarea.value;
  }

  if (summaryValChecker && checkerSelect) {
    summaryValChecker.textContent = checkerSelect.options[checkerSelect.selectedIndex].text;
  }
  if (summaryValTestsCount) {
    summaryValTestsCount.textContent = uploadedTests.length.toString();
  }

  if (summaryTestsTableBody) {
    summaryTestsTableBody.innerHTML = '';
    const t = translations[currentLang];
    uploadedTests.forEach(test => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td class="font-medium">${test.name}</td>
        <td style="color: var(--text-secondary);">${formatBytes(test.size)}</td>
        <td style="text-align: center; color: ${test.useInStatements ? 'var(--accent-color)' : 'var(--text-secondary)'}; font-weight: ${test.useInStatements ? '600' : 'normal'}">
          ${test.useInStatements ? t.yes : t.no}
        </td>
      `;
      summaryTestsTableBody.appendChild(tr);
    });
  }
}

// Wrapper for uploader trigger
async function triggerUploadFlow() {
  const t = translations[currentLang];
  const confirmed = await showCustomConfirm(
    t.uploadConfirmAlert,
    currentLang === 'en' ? 'Confirm Upload' : 'Подтверждение отправки',
    currentLang === 'en' ? 'Upload' : 'Загрузить',
    currentLang === 'en' ? 'Cancel' : 'Отмена'
  );
  if (confirmed) {
    // Hide back button and begin
    backToStep3Btn.style.display = 'none';
    confirmUploadBtn.disabled = true;
    confirmUploadBtn.classList.add('loading');
    if (uploadProgressContainer) uploadProgressContainer.style.display = 'block';

    startPolygonUpload().catch(async (err) => {
      console.error(err);
      addUploadLog(t.logError(err.message || err), 'error');
      if (progressHeaderTitle) progressHeaderTitle.textContent = t.progressHeaderTitleFailed;
      if (progressSpinner) progressSpinner.style.display = 'none';

      // Allow trying again
      backToStep3Btn.style.display = 'block';
      confirmUploadBtn.disabled = false;
      confirmUploadBtn.classList.remove('loading');
    });
  }
}

// Polygon API Uploader Pipeline
async function startPolygonUpload() {
  const t = translations[currentLang];
  const apiKey = localStorage.getItem('poly_api_key');
  const apiSecret = localStorage.getItem('poly_api_secret');

  if (!apiKey || !apiSecret) {
    throw new Error(currentLang === 'en' ? 'API keys not found in local storage!' : 'Ключи API не найдены в локальном хранилище!');
  }

  const nameVal = document.getElementById('prob-name').value.trim();
  const timeVal = document.getElementById('prob-time-limit').value.trim();
  const memoryVal = document.getElementById('prob-memory-limit').value.trim();
  const legendVal = document.getElementById('prob-legend').value.trim();
  const inputVal = document.getElementById('prob-input-format').value.trim();
  const outputVal = document.getElementById('prob-output-format').value.trim();
  const notesVal = document.getElementById('prob-notes').value.trim();
  const tutorialVal = document.getElementById('prob-tutorial').value.trim();

  const statementLang = document.getElementById('prob-statement-lang').value;

  addUploadLog(t.logStarting, 'pending');
  if (uploadProgressBar) uploadProgressBar.style.width = '5%';

  let problemId = editingProblemId;

  if (!problemId) {
    // 1. problem.create
    const sysInputVal = document.getElementById('prob-system-name').value.trim();
    const systemName = sysInputVal ? toSystemName(sysInputVal) : toSystemName(nameVal);

    addUploadLog(t.logCreatingProblem(systemName), 'info');
    const createRes = await callPolygonApi('problem.create', { name: systemName }, apiKey, apiSecret);
    if (createRes.status !== 'OK') {
      throw new Error(createRes.comment || 'Failed to create problem on Polygon');
    }
    problemId = createRes.result.id;
    addUploadLog(t.logProblemCreated(problemId), 'success');
  } else {
    addUploadLog(currentLang === 'en' ? `Using existing problem ID: ${problemId}` : `Использование существующего ID задачи: ${problemId}`, 'success');
  }
  if (uploadProgressBar) uploadProgressBar.style.width = '20%';

  // 2. problem.updateInfo
  addUploadLog(t.logUpdatingInfo, 'info');
  const infoRes = await callPolygonApi('problem.updateInfo', {
    problemId: problemId,
    timeLimit: timeVal,
    memoryLimit: memoryVal
  }, apiKey, apiSecret);
  if (infoRes.status !== 'OK') {
    throw new Error(infoRes.comment || 'Failed to update problem limits');
  }
  addUploadLog(t.logInfoUpdated, 'success');
  if (uploadProgressBar) uploadProgressBar.style.width = '40%';

  // 3. problem.saveStatement
  addUploadLog(t.logSavingStatement(statementLang), 'info');
  const stmtRes = await callPolygonApi('problem.saveStatement', {
    problemId: problemId,
    lang: statementLang,
    name: nameVal,
    legend: legendVal,
    input: inputVal,
    output: outputVal,
    notes: notesVal,
    tutorial: tutorialVal
  }, apiKey, apiSecret);
  if (stmtRes.status !== 'OK') {
    throw new Error(stmtRes.comment || 'Failed to save statements');
  }
  addUploadLog(t.logStatementSaved, 'success');
  if (uploadProgressBar) uploadProgressBar.style.width = '60%';

  // 4. problem.saveSolution
  addUploadLog(t.logSavingSolution, 'info');
  const solLang = solLangSelect.value;
  const solCode = solCodeTextarea.value;

  let solFileName = 'solution.cpp';
  if (solLang.startsWith('python') || solLang.startsWith('pypy')) solFileName = 'solution.py';
  else if (solLang.startsWith('java')) solFileName = 'Solution.java';
  else if (solLang.startsWith('rust')) solFileName = 'solution.rs';
  else if (solLang.startsWith('go')) solFileName = 'solution.go';
  else if (solLang.startsWith('kotlin')) solFileName = 'solution.kt';
  else if (solLang.startsWith('csharp')) solFileName = 'solution.cs';

  const solRes = await callPolygonApi('problem.saveSolution', {
    problemId: problemId,
    name: solFileName,
    file: solCode,
    tag: 'MA'
  }, apiKey, apiSecret);
  if (solRes.status !== 'OK') {
    throw new Error(solRes.comment || 'Failed to upload solution file');
  }
  addUploadLog(t.logSolutionSaved, 'success');
  if (uploadProgressBar) uploadProgressBar.style.width = '75%';

  // 5. problem.setChecker
  const checkerName = checkerSelect.value;
  if (checkerName && checkerName !== 'custom') {
    addUploadLog(t.logSettingChecker(checkerName), 'info');
    const checkerRes = await callPolygonApi('problem.setChecker', {
      problemId: problemId,
      checker: checkerName
    }, apiKey, apiSecret);
    if (checkerRes.status !== 'OK') {
      throw new Error(checkerRes.comment || 'Failed to configure checker');
    }
    addUploadLog(t.logCheckerSet, 'success');
  }
  if (uploadProgressBar) uploadProgressBar.style.width = '85%';

  // 6. problem.saveTest
  if (uploadedTests.length > 0) {
    addUploadLog(t.logUploadingTests(uploadedTests.length), 'info');
    for (let i = 0; i < uploadedTests.length; i++) {
      const test = uploadedTests[i];
      const testIdx = i + 1;
      addUploadLog(t.logUploadingTestFile(test.name, testIdx), 'info');

      const testRes = await callPolygonApi('problem.saveTest', {
        problemId: problemId,
        testset: 'tests',
        testIndex: testIdx.toString(),
        testInput: test.content || '',
        testUseInStatements: test.useInStatements ? 'true' : 'false'
      }, apiKey, apiSecret);
      if (testRes.status !== 'OK') {
        throw new Error(testRes.comment || `Failed to upload test ${testIdx} (${test.name})`);
      }
      addUploadLog(t.logTestFileUploaded(test.name, testIdx), 'success');

      const percent = 85 + Math.round((10 * (i + 1)) / uploadedTests.length);
      if (uploadProgressBar) uploadProgressBar.style.width = `${percent}%`;
    }
  } else {
    if (uploadProgressBar) uploadProgressBar.style.width = '90%';
  }

  // 7. problem.commitChanges
  addUploadLog(t.logCommitting, 'info');
  const commitRes = await callPolygonApi('problem.commitChanges', {
    problemId: problemId,
    message: 'Uploaded via QW Poly'
  }, apiKey, apiSecret);
  if (commitRes.status !== 'OK') {
    throw new Error(commitRes.comment || 'Failed to commit changes');
  }
  addUploadLog(t.logCommitted, 'success');
  if (uploadProgressBar) uploadProgressBar.style.width = '100%';

  addUploadLog(t.logUploadFinished, 'success');

  if (progressHeaderTitle) progressHeaderTitle.textContent = t.progressHeaderTitleSuccess;
  if (progressSpinner) progressSpinner.style.display = 'none';

  // Finish uploader setup
  confirmUploadBtn.disabled = false;
  confirmUploadBtn.classList.remove('loading');
  confirmUploadBtn.innerHTML = `<span>${t.btnBackToDash}</span>`;
  confirmUploadBtn.onclick = () => {
    // Reload to refresh problem list in dashboard
    location.reload();
  };
}

// Logo click event to go back to Dashboard
const logoContainer = document.querySelector('.logo-container');
if (logoContainer) {
  logoContainer.addEventListener('click', () => {
    const apiKey = localStorage.getItem('poly_api_key');
    if (apiKey) {
      hideAllWizardViewsAndShowDashboard();
    }
  });
}

// Global active editing problem ID & statement cache
let editingProblemId = null;
let lastFetchedStatement = null;

// Download plain text files from Polygon (e.g. solutions, tests inputs)
async function downloadPlainFile(methodName, params, apiKey, apiSecret) {
  const rand = generateRand();
  const time = Math.floor(Date.now() / 1000).toString();
  const fullParams = { ...params, apiKey, time };
  const sortedKeys = Object.keys(fullParams).sort();
  const sortedParamsList = [];

  for (const key of sortedKeys) {
    const val = fullParams[key];
    sortedParamsList.push(`${key}=${val}`);
  }

  const queryString = sortedParamsList.join('&');
  const signatureText = `${rand}/${methodName}?${queryString}#${apiSecret}`;
  const hash = await sha512(signatureText);
  const apiSig = rand + hash;

  const bodyParams = new URLSearchParams();
  for (const key of sortedKeys) {
    bodyParams.append(key, fullParams[key]);
  }
  bodyParams.append('apiSig', apiSig);

  const response = await fetch(`/api/${methodName}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: bodyParams
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return await response.text();
}

// Open and populate existing problem from Polygon API
async function openExistingProblem(probId, btn) {
  const originalHtml = btn.innerHTML;
  const t = translations[currentLang];

  btn.disabled = true;
  btn.innerHTML = `<span class="spinner green-spinner small-spinner" style="display:inline-block; vertical-align:middle; margin-right:4px;"></span> ${currentLang === 'en' ? 'Opening...' : 'Открытие...'}`;

  const apiKey = localStorage.getItem('poly_api_key');
  const apiSecret = localStorage.getItem('poly_api_secret');

  try {
    // 1. Get info (limits)
    const infoRes = await callPolygonApi('problem.info', { problemId: probId }, apiKey, apiSecret);
    if (infoRes.status !== 'OK') throw new Error(infoRes.comment);

    // 2. Get statements
    const statementsRes = await callPolygonApi('problem.statements', { problemId: probId }, apiKey, apiSecret);
    if (statementsRes.status !== 'OK') throw new Error(statementsRes.comment);

    // Choose statement language
    let stmtLang = 'russian';
    let statement = statementsRes.result['russian'];
    if (!statement && statementsRes.result['english']) {
      stmtLang = 'english';
      statement = statementsRes.result['english'];
    } else if (!statement) {
      const keys = Object.keys(statementsRes.result);
      if (keys.length > 0) {
        stmtLang = keys[0];
        statement = statementsRes.result[stmtLang];
      } else {
        stmtLang = currentLang === 'en' ? 'english' : 'russian';
        statement = {};
      }
    }

    // 3. Get solutions and find main correct solution (MA)
    let mainSolCode = '';
    let mainSolLang = 'cpp.g++20';
    try {
      const solutionsRes = await callPolygonApi('problem.solutions', { problemId: probId }, apiKey, apiSecret);
      if (solutionsRes.status === 'OK' && solutionsRes.result) {
        const mainSol = solutionsRes.result.find(s => s.tag === 'MA');
        if (mainSol) {
          mainSolLang = mainSol.sourceType || 'cpp.g++20';
          mainSolCode = await downloadPlainFile('problem.viewSolution', {
            problemId: probId,
            name: mainSol.name
          }, apiKey, apiSecret);
        }
      }
    } catch (solErr) {
      console.warn('Failed to load solutions:', solErr);
    }

    // 4. Get checker
    let checkerName = 'std::ncmp.cpp';
    try {
      const checkerRes = await callPolygonApi('problem.checker', { problemId: probId }, apiKey, apiSecret);
      if (checkerRes.status === 'OK' && checkerRes.result) {
        checkerName = checkerRes.result;
      }
    } catch (checkErr) {
      console.warn('Failed to load checker:', checkErr);
    }

    // Save statement for sample test output resolution
    lastFetchedStatement = statement;

    // 5. Get tests and download inputs and answers
    uploadedTests = [];
    try {
      const testsRes = await callPolygonApi('problem.tests', { problemId: probId, testset: 'tests' }, apiKey, apiSecret);
      if (testsRes.status === 'OK' && testsRes.result) {
        const tests = testsRes.result;
        const testPromises = tests.map(async (test) => {
          try {
            const inputContent = await downloadPlainFile('problem.testInput', {
              problemId: probId,
              testset: 'tests',
              testIndex: test.index.toString()
            }, apiKey, apiSecret);

            let answerContent = '';
            try {
              answerContent = await downloadPlainFile('problem.testAnswer', {
                problemId: probId,
                testset: 'tests',
                testIndex: test.index.toString()
              }, apiKey, apiSecret);
            } catch (ansErr) {
              console.warn(`Could not fetch testAnswer for test ${test.index}:`, ansErr);
            }

            return {
              name: `test${test.index}.txt`,
              size: inputContent.length,
              useInStatements: !!test.useInStatements,
              content: inputContent,
              answer: answerContent
            };
          } catch (e) {
            console.warn(`Failed to fetch test ${test.index}:`, e);
            return {
              name: `test${test.index}.txt`,
              size: 0,
              useInStatements: !!test.useInStatements,
              content: '',
              answer: ''
            };
          }
        });
        uploadedTests = await Promise.all(testPromises);
      }
    } catch (testsErr) {
      console.warn('Failed to load tests:', testsErr);
    }

    // Pre-populate Step 1
    document.getElementById('prob-name').value = statement.name || '';
    document.getElementById('prob-system-name').value = '';
    document.getElementById('prob-statement-lang').value = stmtLang;
    document.getElementById('prob-time-limit').value = infoRes.result.timeLimit || 1000;
    document.getElementById('prob-memory-limit').value = infoRes.result.memoryLimit || 256;
    document.getElementById('prob-legend').value = statement.legend || '';
    document.getElementById('prob-input-format').value = statement.input || '';
    document.getElementById('prob-output-format').value = statement.output || '';
    document.getElementById('prob-notes').value = statement.notes || '';
    document.getElementById('prob-tutorial').value = statement.tutorial || '';

    // Dispatch input events
    ['prob-name', 'prob-time-limit', 'prob-memory-limit', 'prob-legend', 'prob-input-format', 'prob-output-format', 'prob-notes', 'prob-tutorial'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.dispatchEvent(new Event('input'));
    });

    // Pre-populate Step 2
    if (solLangSelect) {
      solLangSelect.value = mainSolLang;
      solLangSelect.dispatchEvent(new Event('change'));
    }
    if (solCodeTextarea) {
      solCodeTextarea.value = mainSolCode;
      solCodeTextarea.dispatchEvent(new Event('input'));
    }

    // Pre-populate Step 3
    if (checkerSelect) {
      let matched = false;
      for (let i = 0; i < checkerSelect.options.length; i++) {
        if (checkerSelect.options[i].value === checkerName) {
          checkerSelect.selectedIndex = i;
          matched = true;
          break;
        }
      }
      if (!matched) {
        checkerSelect.value = 'custom';
      }
      checkerSelect.dispatchEvent(new Event('change'));
    }

    renderTestsTable();
    editingProblemId = probId;

    dashboardView.style.opacity = '0';
    dashboardView.style.transform = 'translateY(-10px)';
    dashboardView.style.transition = 'opacity 0.3s ease, transform 0.3s ease';

    setTimeout(() => {
      dashboardView.style.display = 'none';
      createProblemView.style.display = 'block';

      updateWizardTitleForEdit();

      setTimeout(() => {
        createProblemView.style.opacity = '1';
        createProblemView.style.transform = 'translateY(0)';
        createProblemView.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
      }, 50);
    }, 300);

  } catch (err) {
    console.error(err);
    alert((currentLang === 'en' ? 'Failed to open problem: ' : 'Не удалось открыть задачу: ') + (err.message || err));
  } finally {
    btn.disabled = false;
    btn.innerHTML = originalHtml;
  }
}

// Go to dashboard view and hide wizard views smoothly with a save prompt
async function hideAllWizardViewsAndShowDashboard() {
  const wizardViews = [
    createProblemView,
    uploadSolutionView,
    checkerTestsView,
    confirmationView
  ];

  let currentActive = null;
  wizardViews.forEach(v => {
    if (v && v.style.display !== 'none') {
      currentActive = v;
    }
  });

  if (!currentActive) return;

  const saveConfirmMsg = currentLang === 'en'
    ? 'Would you like to save your draft changes?'
    : 'Хотите сохранить внесенные изменения?';

  const saveChanges = await showCustomConfirm(
    saveConfirmMsg,
    currentLang === 'en' ? 'Unsaved Changes' : 'Несохраненные изменения',
    currentLang === 'en' ? 'Save' : 'Сохранить',
    currentLang === 'en' ? 'Discard' : 'Сбросить'
  );
  if (!saveChanges) {
    clearWizardData();
  }

  currentActive.style.opacity = '0';
  currentActive.style.transform = 'translateY(-10px)';
  currentActive.style.transition = 'opacity 0.3s ease, transform 0.3s ease';

  setTimeout(() => {
    currentActive.style.display = 'none';
    dashboardView.style.display = 'block';

    const apiKey = localStorage.getItem('poly_api_key');
    const apiSecret = localStorage.getItem('poly_api_secret');
    if (apiKey && apiSecret) {
      callPolygonApi('problems.list', {}, apiKey, apiSecret)
        .then(res => {
          if (res.status === 'OK') {
            renderProblems(res.result);
          }
        })
        .catch(err => console.error('Failed to reload problems:', err));
    }

    setTimeout(() => {
      dashboardView.style.opacity = '1';
      dashboardView.style.transform = 'translateY(0)';
      dashboardView.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
    }, 50);
  }, 300);
}

// Update Step header titles when editing an existing problem
function updateWizardTitleForEdit() {
  const t = translations[currentLang];
  if (editingProblemId) {
    if (stepTitle) stepTitle.textContent = `${currentLang === 'en' ? 'Edit Problem' : 'Редактирование задачи'} (ID: ${editingProblemId})`;
    if (btnFinishProblemText) btnFinishProblemText.textContent = currentLang === 'en' ? 'Review & Submit' : 'Подтвердить изменения';
    if (confirmUploadBtn) confirmUploadBtn.querySelector('span').textContent = currentLang === 'en' ? 'Commit & Send Changes' : 'Зафиксировать и отправить изменения';
  } else {
    if (stepTitle) stepTitle.textContent = t.stepTitle;
    if (btnFinishProblemText) btnFinishProblemText.textContent = t.btnFinishProblem;
    if (confirmUploadBtn) confirmUploadBtn.querySelector('span').textContent = t.btnConfirmUploadText;
  }
}

// Clear all master data and forms from memory
function clearWizardData() {
  editingProblemId = null;
  uploadedTests = [];

  const probNameInput = document.getElementById('prob-name');
  const probSysNameInput = document.getElementById('prob-system-name');
  const probStatementLang = document.getElementById('prob-statement-lang');
  const probTimeInput = document.getElementById('prob-time-limit');
  const probMemInput = document.getElementById('prob-memory-limit');
  const probLegendInput = document.getElementById('prob-legend');
  const probInputFormat = document.getElementById('prob-input-format');
  const probOutputFormat = document.getElementById('prob-output-format');
  const probNotes = document.getElementById('prob-notes');
  const probTutorial = document.getElementById('prob-tutorial');

  if (probNameInput) probNameInput.value = '';
  if (probSysNameInput) probSysNameInput.value = '';
  if (probStatementLang) probStatementLang.value = 'russian';
  if (probTimeInput) probTimeInput.value = '1000';
  if (probMemInput) probMemInput.value = '256';
  if (probLegendInput) probLegendInput.value = '';
  if (probInputFormat) probInputFormat.value = '';
  if (probOutputFormat) probOutputFormat.value = '';
  if (probNotes) probNotes.value = '';
  if (probTutorial) probTutorial.value = '';

  if (solCodeTextarea) solCodeTextarea.value = '';
  if (solLangSelect) solLangSelect.value = 'cpp.g++20';

  if (checkerSelect) checkerSelect.value = 'std::ncmp.cpp';

  updateStatementPreview();
  renderTestsTable();
  updateWizardTitleForEdit();
}

// Custom Promise-based Alert Dialog Modal
function showCustomAlert(message, title = null) {
  return new Promise((resolve) => {
    if (!customModalOverlay || !customModalTitle || !customModalMessage || !customModalOkBtn || !customModalCancelBtn) {
      console.warn('Custom modal elements not found, falling back to native alert:', message);
      alert(message);
      resolve();
      return;
    }

    customModalTitle.textContent = title || (currentLang === 'en' ? 'Notification' : 'Оповещение');
    customModalMessage.textContent = message;

    customModalCancelBtn.style.display = 'none';
    customModalOkBtn.textContent = 'OK';
    customModalOverlay.style.display = 'flex';

    const handleOk = () => {
      customModalOverlay.style.display = 'none';
      customModalOkBtn.removeEventListener('click', handleOk);
      resolve();
    };
    customModalOkBtn.addEventListener('click', handleOk);
  });
}

// Custom Promise-based Confirm Dialog Modal
function showCustomConfirm(message, title = null, okText = null, cancelText = null) {
  return new Promise((resolve) => {
    if (!customModalOverlay || !customModalTitle || !customModalMessage || !customModalOkBtn || !customModalCancelBtn) {
      console.warn('Custom modal elements not found, falling back to native confirm:', message);
      const res = confirm(message);
      resolve(res);
      return;
    }

    customModalTitle.textContent = title || (currentLang === 'en' ? 'Confirmation' : 'Подтверждение');
    customModalMessage.textContent = message;

    customModalOkBtn.textContent = okText || (currentLang === 'en' ? 'OK' : 'Да');
    customModalCancelBtn.textContent = cancelText || (currentLang === 'en' ? 'Cancel' : 'Отмена');

    customModalCancelBtn.style.display = 'block';
    customModalOverlay.style.display = 'flex';

    const handleOk = () => {
      customModalOverlay.style.display = 'none';
      cleanup();
      resolve(true);
    };

    const handleCancel = () => {
      customModalOverlay.style.display = 'none';
      cleanup();
      resolve(false);
    };

    function cleanup() {
      customModalOkBtn.removeEventListener('click', handleOk);
      customModalCancelBtn.removeEventListener('click', handleCancel);
    }

    customModalOkBtn.addEventListener('click', handleOk);
    customModalCancelBtn.addEventListener('click', handleCancel);
  });
}

// ============================================================================
// QW_Tricky Task Exporter
// ============================================================================

let currentExportPayload = null;

function openQwtExportModal(taskData, mainTests) {
  currentExportPayload = { taskData, mainTests };

  if (qwtTaskIdInput) qwtTaskIdInput.value = taskData.id || 'task_a';
  if (qwtTaskTitleInput) qwtTaskTitleInput.value = taskData.title || '';
  if (qwtTimeLimitInput) qwtTimeLimitInput.value = taskData.timeLimit || 2000;
  if (qwtMemoryLimitInput) qwtMemoryLimitInput.value = taskData.memoryLimit || 256;

  const exampleCount = (taskData.examples || []).length;
  const testCount = mainTests.length;

  if (qwtSummaryText) {
    qwtSummaryText.textContent = currentLang === 'en'
      ? `Examples: ${exampleCount} test(s) | Main Tests: ${testCount} input file(s)`
      : `Примеры: ${exampleCount} тест(ов) | Основные тесты: ${testCount} файл(ов) входа`;
  }

  if (qwtExportModal) qwtExportModal.style.display = 'flex';
}

function closeQwtExportModal() {
  if (qwtExportModal) qwtExportModal.style.display = 'none';
}

if (qwtModalClose) {
  qwtModalClose.addEventListener('click', closeQwtExportModal);
}

function gatherWizardTaskData() {
  const nameVal = (document.getElementById('prob-name')?.value || '').trim() || 'Untitled Problem';
  let sysNameVal = (document.getElementById('prob-system-name')?.value || '').trim();
  if (!sysNameVal) {
    sysNameVal = toSystemName(nameVal);
  }
  const timeVal = parseInt(document.getElementById('prob-time-limit')?.value, 10) || 2000;
  const memVal = parseInt(document.getElementById('prob-memory-limit')?.value, 10) || 256;
  const legendVal = document.getElementById('prob-legend')?.value || '';
  const inputVal = document.getElementById('prob-input-format')?.value || '';
  const outputVal = document.getElementById('prob-output-format')?.value || '';

  const examples = [];
  const mainTests = [];

  uploadedTests.forEach((test, idx) => {
    if (test.useInStatements) {
      examples.push({
        input: test.content || '',
        output: test.answer || test.output || ''
      });
    }
    mainTests.push({
      name: String(idx + 1).padStart(2, '0'),
      content: test.content || ''
    });
  });

  // Fallback / merge with sampleTests from statement if output is empty
  if (lastFetchedStatement && Array.isArray(lastFetchedStatement.sampleTests)) {
    lastFetchedStatement.sampleTests.forEach((sample, idx) => {
      if (examples[idx]) {
        if (!examples[idx].output && sample.output) {
          examples[idx].output = sample.output;
        }
        if (!examples[idx].input && sample.input) {
          examples[idx].input = sample.input;
        }
      } else {
        examples.push({
          input: sample.input || '',
          output: sample.output || ''
        });
      }
    });
  }

  const taskData = {
    id: sysNameVal,
    title: nameVal,
    description: legendVal,
    inputFormat: inputVal,
    outputFormat: outputVal,
    timeLimit: timeVal,
    memoryLimit: memVal,
    examples: examples
  };

  return { taskData, mainTests };
}

if (exportTrickyBtn) {
  applyRippleEffect(exportTrickyBtn);
  exportTrickyBtn.addEventListener('click', () => {
    const payload = gatherWizardTaskData();
    openQwtExportModal(payload.taskData, payload.mainTests);
  });
}

// Directory Export via File System Access API
if (qwtSaveFolderBtn) {
  applyRippleEffect(qwtSaveFolderBtn);
  qwtSaveFolderBtn.addEventListener('click', async () => {
    if (!currentExportPayload) return;

    const folderName = (qwtTaskIdInput?.value || '').trim() || 'task';
    const title = (qwtTaskTitleInput?.value || '').trim() || folderName;
    const timeLimit = parseInt(qwtTimeLimitInput?.value, 10) || 2000;
    const memoryLimit = parseInt(qwtMemoryLimitInput?.value, 10) || 256;

    const taskData = {
      ...currentExportPayload.taskData,
      id: folderName,
      title: title,
      timeLimit: timeLimit,
      memoryLimit: memoryLimit
    };
    const mainTests = currentExportPayload.mainTests;

    if (typeof window.showDirectoryPicker !== 'function') {
      showCustomAlert(
        currentLang === 'en'
          ? 'Your browser does not support direct folder selection. Please use the ZIP Download option.'
          : 'Ваш браузер не поддерживает прямое сохранение в папку. Пожалуйста, используйте вариант скачивания ZIP-архива.',
        currentLang === 'en' ? 'Notice' : 'Уведомление'
      );
      return;
    }

    try {
      const parentDirHandle = await window.showDirectoryPicker({ mode: 'readwrite' });
      const taskDirHandle = await parentDirHandle.getDirectoryHandle(folderName, { create: true });

      // Write problem.json
      const jsonHandle = await taskDirHandle.getFileHandle('problem.json', { create: true });
      const writableJson = await jsonHandle.createWritable();
      await writableJson.write(JSON.stringify(taskData, null, 2));
      await writableJson.close();

      // Write tests/ folder (inputs only)
      if (mainTests.length > 0) {
        const testsDirHandle = await taskDirHandle.getDirectoryHandle('tests', { create: true });
        for (let i = 0; i < mainTests.length; i++) {
          const fileName = String(i + 1).padStart(2, '0');
          const fileHandle = await testsDirHandle.getFileHandle(fileName, { create: true });
          const writableTest = await fileHandle.createWritable();
          await writableTest.write(mainTests[i].content || '');
          await writableTest.close();
        }
      }

      closeQwtExportModal();
      showCustomAlert(
        currentLang === 'en'
          ? `Task folder "${folderName}" successfully created in selected directory!`
          : `Папка задачи "${folderName}" успешно создана в выбранной директории!`,
        currentLang === 'en' ? 'Export Successful' : 'Экспорт завершен'
      );
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('Export to folder error:', err);
        showCustomAlert(
          (currentLang === 'en' ? 'Export failed: ' : 'Ошибка экспорта: ') + err.message,
          currentLang === 'en' ? 'Error' : 'Ошибка'
        );
      }
    }
  });
}

// Download ZIP Export
if (qwtDownloadZipBtn) {
  applyRippleEffect(qwtDownloadZipBtn);
  qwtDownloadZipBtn.addEventListener('click', () => {
    if (!currentExportPayload) return;

    const folderName = (qwtTaskIdInput?.value || '').trim() || 'task';
    const title = (qwtTaskTitleInput?.value || '').trim() || folderName;
    const timeLimit = parseInt(qwtTimeLimitInput?.value, 10) || 2000;
    const memoryLimit = parseInt(qwtMemoryLimitInput?.value, 10) || 256;

    const taskData = {
      ...currentExportPayload.taskData,
      id: folderName,
      title: title,
      timeLimit: timeLimit,
      memoryLimit: memoryLimit
    };
    const mainTests = currentExportPayload.mainTests;

    const zip = new SimpleZip();
    zip.addFile(`${folderName}/problem.json`, JSON.stringify(taskData, null, 2));

    mainTests.forEach((test, idx) => {
      const fileName = String(idx + 1).padStart(2, '0');
      zip.addFile(`${folderName}/tests/${fileName}`, test.content || '');
    });

    const blob = zip.generateBlob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${folderName}.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    closeQwtExportModal();
    showCustomAlert(
      currentLang === 'en'
        ? `Task package "${folderName}.zip" successfully generated and downloaded!`
        : `Пакет задачи "${folderName}.zip" успешно сгенерирован и скачан!`,
      currentLang === 'en' ? 'Download Started' : 'Загрузка начата'
    );
  });
}


