import katex from 'katex';
import 'katex/dist/katex.css';

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
    title: "QW Poly",
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
    thTestOrder: "#",
    thTestName: "Test File",
    thTestSize: "Size",
    thTestStatements: "Use in Statements",
    thTestActions: "Actions",
    thActions: "Actions",
    btnManualTest: "Add Test Manually",
    modalAddTestTitle: "Add Test Manually",
    modalEditTestTitle: "Edit Test",
    modalTestSubtitle: "Enter test input data and parameters.",
    modalTestNameLabel: "Test Name (optional)",
    modalTestInputLabel: "Input Data *",
    modalTestAnswerLabel: "Expected Output / Answer (optional)",
    modalTestUseInStatements: "Use in problem statements",
    modalAddTestBtn: "Add Test",
    btnSaveTest: "Save Test",
    btnMoveUp: "Move Up",
    btnMoveDown: "Move Down",
    btnEditTest: "Edit",
    btnRemove: "Remove",
    testInputRequiredAlert: "Please enter input data for the test.",
    dragToReorder: "Drag to reorder",
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
    tabManualTests: "Manual Tests",
    tabGeneratorTests: "Test Generator",
    genInfoPrefix: "See the guide to learn ",
    genInfoLink: "how testlib generators work",
    genInfoSuffix: " in Polygon and Codeforces.",
    genDropText: "Drag & drop generator files (.cpp, .py, etc.) or click to browse",
    btnAddGeneratorCode: "Add Generator as Code",
    generatorsListHeader: "Uploaded Generators",
    thGenOrder: "#",
    thGenName: "Generator File",
    thGenSize: "Size",
    thGenActions: "Actions",
    lblTestsScriptTitle: "Tests Generation Script",
    lblTestsScriptDesc: "Specify commands to run generators. Each line generates a test, e.g.: gen 10 5 > $",
    testsScriptPlaceholder: "gen 10 5 > $\ngen 100 10 > $\ngen 1000 100 > $",
    generatorModalTitleAdd: "Add Generator",
    generatorModalTitleEdit: "Edit Generator",
    generatorModalSubtitle: "Provide generator source code (C++, Python, etc.)",
    lblGeneratorName: "Filename (e.g. gen.cpp or generator.py) *",
    lblGeneratorCode: "Generator Source Code *",
    generatorSaveBtn: "Save Generator",
    generatorCancelBtn: "Cancel",
    btnDownloadGen: "Download generator file",
    btnEditGen: "Edit generator code",
    btnDeleteGen: "Remove generator",
    genFileAlreadyExists: (name) => `Generator '${name}' already exists.`,
    genFileNameRequired: "Please enter a valid generator filename.",
    genCodeRequired: "Please enter generator source code.",
    summaryLabelGeneratorsCount: "Test Generators:",
    summaryLabelScriptStatus: "Tests Script:",
    summaryScriptConfigured: "Configured",
    summaryScriptNone: "None",
    logUploadingGenerators: (count) => `Uploading ${count} generator file(s)...`,
    logGeneratorUploaded: (name) => `Generator '${name}' uploaded successfully.`,
    logSavingScript: "Saving tests generation script...",
    logScriptSaved: "Tests generation script saved successfully.",
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
    logBuildingPackage: "Launching problem package build on Polygon (full=true, verify=true)...",
    logPackageBuilt: "Problem package build launched successfully on Polygon!",
    logUploadFinished: "All tasks completed successfully! Problem is ready on Polygon.",
    logError: (msg) => `Error: ${msg}`,
    lblPtAutoBuild: "Auto-upload & build package on Polygon",
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
    lblQwtDownloadZip: "Download ZIP Archive",
    dashImportUlearnBtn: "Ulearn Import",
    ulearnModalTitle: "Ulearn Task Import",
    ulearnModalSubtitle: "Enter a task URL from ulearn.me (e.g. https://ulearn.me/course/python/Griby_147686d0-aa0a-456a-9720-001fcd7f6d6c).",
    lblUlearnUrlInput: "Task URL on ulearn.me",
    lblUlearnFetchBtn: "Import Task to Wizard"
  },
  ru: {
    title: "QW Poly",
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
    thTestOrder: "№",
    thTestName: "Файл теста",
    thTestSize: "Размер",
    thTestStatements: "Показывать в условии",
    thTestActions: "Действия",
    thActions: "Действия",
    btnManualTest: "Добавить тест вручную",
    modalAddTestTitle: "Добавить тест вручную",
    modalEditTestTitle: "Редактировать тест",
    modalTestSubtitle: "Введите входные данные и параметры теста.",
    modalTestNameLabel: "Имя файла теста (необязательно)",
    modalTestInputLabel: "Входные данные *",
    modalTestAnswerLabel: "Ожидаемый ответ / вывод (необязательно)",
    modalTestUseInStatements: "Показывать в условии задачи",
    modalAddTestBtn: "Добавить тест",
    btnSaveTest: "Сохранить",
    btnMoveUp: "Вверх",
    btnMoveDown: "Вниз",
    btnEditTest: "Изменить",
    btnRemove: "Удалить",
    testInputRequiredAlert: "Пожалуйста, введите входные данные теста.",
    dragToReorder: "Потяните для изменения порядка",
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
    tabManualTests: "Ручные тесты",
    tabGeneratorTests: "Генератор теста",
    genInfoPrefix: "Обратитесь к ",
    genInfoLink: "руководству по генераторам testlib",
    genInfoSuffix: " для ознакомления с принципом их работы в Polygon.",
    genDropText: "Перетащите файлы генераторов (.cpp, .py и др.) или нажмите для выбора",
    btnAddGeneratorCode: "Добавить код вручную",
    generatorsListHeader: "Загруженные генераторы",
    thGenOrder: "№",
    thGenName: "Файл генератора",
    thGenSize: "Размер",
    thGenActions: "Действия",
    lblTestsScriptTitle: "Скрипт генерации тестов",
    lblTestsScriptDesc: "Укажите команды для запуска генераторов. Каждая строка генерирует тест, например: gen 10 5 > $",
    testsScriptPlaceholder: "gen 10 5 > $\ngen 100 10 > $\ngen 1000 100 > $",
    generatorModalTitleAdd: "Добавить генератор",
    generatorModalTitleEdit: "Редактировать генератор",
    generatorModalSubtitle: "Исходный код генератора (C++, Python и т.д.)",
    lblGeneratorName: "Имя файла (напр. gen.cpp или generator.py) *",
    lblGeneratorCode: "Исходный код генератора *",
    generatorSaveBtn: "Сохранить генератор",
    generatorCancelBtn: "Отмена",
    btnDownloadGen: "Скачать файл",
    btnEditGen: "Редактировать код",
    btnDeleteGen: "Удалить генератор",
    genFileAlreadyExists: (name) => `Генератор '${name}' уже добавлен.`,
    genFileNameRequired: "Пожалуйста, введите корректное имя файла генератора.",
    genCodeRequired: "Пожалуйста, введите исходный код генератора.",
    summaryLabelGeneratorsCount: "Генераторов:",
    summaryLabelScriptStatus: "Скрипт тестов:",
    summaryScriptConfigured: "Настроен",
    summaryScriptNone: "Нет",
    logUploadingGenerators: (count) => `Загрузка генераторов тестов (${count})...`,
    logGeneratorUploaded: (name) => `Генератор '${name}' успешно сохранён.`,
    logSavingScript: "Сохранение скрипта генерации тестов...",
    logScriptSaved: "Скрипт генерации тестов успешно сохранён.",
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
    logBuildingPackage: "Запуск компиляции полного пакета задачи на Polygon (с верификацией)...",
    logPackageBuilt: "Компиляция пакета задачи успешно запущена на Polygon!",
    logUploadFinished: "Процесс завершен! Задача готова на платформе Polygon.",
    logError: (msg) => `Ошибка: ${msg}`,
    lblPtAutoBuild: "Автоматически загрузить на Polygon и скомпилировать пакет",
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
    lblQwtDownloadZip: "Скачать ZIP-архив",
    dashImportUlearnBtn: "Импорт с Ulearn",
    ulearnModalTitle: "Импорт задачи с Ulearn",
    ulearnModalSubtitle: "Введите ссылку на задачу с сайта ulearn.me (например, https://ulearn.me/course/python/Griby_147686d0-aa0a-456a-9720-001fcd7f6d6c).",
    lblUlearnUrlInput: "Ссылка на задачу на ulearn.me",
    lblUlearnFetchBtn: "Импортировать в мастер"
  }
};

// Global Variables
let currentLang = localStorage.getItem('lang') || 'en';
let loadedProblems = [];
let uploadedTests = [];
let problemGenerators = [];
let activeTestsTab = 'manual';


const themeToggleBtn = document.getElementById('theme-toggle');
const themeIcon = document.getElementById('theme-icon');

const langToggleBtn = document.getElementById('lang-toggle');
const langLabel = document.getElementById('lang-label');
const logoSuffix = document.getElementById('logo-suffix');
const authTitle = document.getElementById('auth-title');
const authSubtitle = document.getElementById('auth-subtitle');
const labelApiKey = document.getElementById('label-api-key');
const labelApiSecret = document.getElementById('label-api-secret');
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
const thTestOrder = document.getElementById('th-test-order');
const thTestName = document.getElementById('th-test-name');
const thTestSize = document.getElementById('th-test-size');
const thTestStatements = document.getElementById('th-test-statements');
const thTestActions = document.getElementById('th-test-actions');
const btnAddManualTest = document.getElementById('btn-add-manual-test');
const btnAddManualTestText = document.getElementById('btn-add-manual-test-text');
const btnAddManualTestTable = document.getElementById('btn-add-manual-test-table');
const btnAddManualTestTableText = document.getElementById('btn-add-manual-test-table-text');

const manualTestModal = document.getElementById('manual-test-modal');
const manualTestModalTitle = document.getElementById('manual-test-modal-title');
const manualTestModalSubtitle = document.getElementById('manual-test-modal-subtitle');
const manualTestModalClose = document.getElementById('manual-test-modal-close');
const manualTestEditIndex = document.getElementById('manual-test-edit-index');
const manualTestName = document.getElementById('manual-test-name');
const lblManualTestName = document.getElementById('lbl-manual-test-name');
const manualTestInput = document.getElementById('manual-test-input');
const lblManualTestInput = document.getElementById('lbl-manual-test-input');
const manualTestOutput = document.getElementById('manual-test-output');
const lblManualTestOutput = document.getElementById('lbl-manual-test-output');
const manualTestStatements = document.getElementById('manual-test-statements');
const lblManualTestStatements = document.getElementById('lbl-manual-test-statements');
const manualTestCancelBtn = document.getElementById('manual-test-cancel-btn');
const manualTestSaveBtn = document.getElementById('manual-test-save-btn');
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

const tabBtnManualTests = document.getElementById('tab-btn-manual-tests');
const tabBtnGeneratorTests = document.getElementById('tab-btn-generator-tests');
const tabLabelManualTests = document.getElementById('tab-label-manual-tests');
const tabLabelGeneratorTests = document.getElementById('tab-label-generator-tests');
const badgeManualTestsCount = document.getElementById('badge-manual-tests-count');
const badgeGeneratorTestsCount = document.getElementById('badge-generator-tests-count');
const sectionManualTests = document.getElementById('section-manual-tests');
const sectionGeneratorTests = document.getElementById('section-generator-tests');
const genInfoPrefix = document.getElementById('gen-info-prefix');
const genInfoLink = document.getElementById('gen-info-link');
const genInfoSuffix = document.getElementById('gen-info-suffix');
const generatorDropZone = document.getElementById('generator-drop-zone');
const generatorDropText = document.getElementById('generator-drop-text');
const generatorFileInput = document.getElementById('generator-file-input');
const btnAddGeneratorCode = document.getElementById('btn-add-generator-code');
const btnAddGeneratorCodeText = document.getElementById('btn-add-generator-code-text');
const generatorsListContainer = document.getElementById('generators-list-container');
const generatorsListHeader = document.getElementById('generators-list-header');
const thGenOrder = document.getElementById('th-gen-order');
const thGenName = document.getElementById('th-gen-name');
const thGenSize = document.getElementById('th-gen-size');
const thGenActions = document.getElementById('th-gen-actions');
const generatorsTableBody = document.getElementById('generators-table-body');
const lblTestsScriptTitle = document.getElementById('lbl-tests-script-title');
const lblTestsScriptDesc = document.getElementById('lbl-tests-script-desc');
const testsScriptInput = document.getElementById('tests-script-input');

const generatorModal = document.getElementById('generator-modal');
const generatorModalTitle = document.getElementById('generator-modal-title');
const generatorModalSubtitle = document.getElementById('generator-modal-subtitle');
const generatorModalClose = document.getElementById('generator-modal-close');
const generatorEditIndex = document.getElementById('generator-edit-index');
const generatorName = document.getElementById('generator-name');
const lblGeneratorName = document.getElementById('lbl-generator-name');
const generatorCode = document.getElementById('generator-code');
const lblGeneratorCode = document.getElementById('lbl-generator-code');
const generatorCancelBtn = document.getElementById('generator-cancel-btn');
const generatorSaveBtn = document.getElementById('generator-save-btn');
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
const summaryLabelGeneratorsCount = document.getElementById('summary-label-generators-count');
const summaryValGeneratorsCount = document.getElementById('summary-val-generators-count');
const summaryLabelScriptStatus = document.getElementById('summary-label-script-status');
const summaryValScriptStatus = document.getElementById('summary-val-script-status');
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
  
  const lblPtAutoBuild = document.getElementById('lbl-pt-auto-build');
  if (lblPtAutoBuild && t.lblPtAutoBuild) lblPtAutoBuild.textContent = t.lblPtAutoBuild;
  
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
  if (thTestOrder) thTestOrder.textContent = t.thTestOrder;
  if (thTestName) thTestName.textContent = t.thTestName;
  if (thTestSize) thTestSize.textContent = t.thTestSize;
  if (thTestStatements) thTestStatements.textContent = t.thTestStatements;
  if (thTestActions) thTestActions.textContent = t.thTestActions;
  if (btnAddManualTestText) btnAddManualTestText.textContent = t.btnManualTest;
  if (btnAddManualTestTableText) btnAddManualTestTableText.textContent = t.btnManualTest;

  // Manual Test Modal translations
  if (manualTestModalSubtitle) manualTestModalSubtitle.textContent = t.modalTestSubtitle;
  if (lblManualTestName) lblManualTestName.textContent = t.modalTestNameLabel;
  if (lblManualTestInput) lblManualTestInput.textContent = t.modalTestInputLabel;
  if (lblManualTestOutput) lblManualTestOutput.textContent = t.modalTestAnswerLabel;
  if (lblManualTestStatements) lblManualTestStatements.textContent = t.modalTestUseInStatements;
  if (manualTestCancelBtn) manualTestCancelBtn.textContent = currentLang === 'en' ? 'Cancel' : 'Отмена';
  if (manualTestSaveBtn) {
    const isEdit = manualTestEditIndex && parseInt(manualTestEditIndex.value, 10) >= 0;
    manualTestSaveBtn.textContent = isEdit ? t.btnSaveTest : t.modalAddTestBtn;
  }
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

  // Mode tabs & generator translations
  if (tabLabelManualTests) tabLabelManualTests.textContent = t.tabManualTests;
  if (tabLabelGeneratorTests) tabLabelGeneratorTests.textContent = t.tabGeneratorTests;
  if (genInfoPrefix) genInfoPrefix.textContent = t.genInfoPrefix;
  if (genInfoLink) genInfoLink.textContent = t.genInfoLink;
  if (genInfoSuffix) genInfoSuffix.textContent = t.genInfoSuffix;
  if (generatorDropText && (!generatorFileInput || !generatorFileInput.files || generatorFileInput.files.length === 0)) {
    generatorDropText.textContent = t.genDropText;
  }
  if (btnAddGeneratorCodeText) btnAddGeneratorCodeText.textContent = t.btnAddGeneratorCode;
  if (generatorsListHeader) generatorsListHeader.textContent = t.generatorsListHeader;
  if (thGenOrder) thGenOrder.textContent = t.thGenOrder;
  if (thGenName) thGenName.textContent = t.thGenName;
  if (thGenSize) thGenSize.textContent = t.thGenSize;
  if (thGenActions) thGenActions.textContent = t.thGenActions;
  if (lblTestsScriptTitle) lblTestsScriptTitle.textContent = t.lblTestsScriptTitle;
  if (lblTestsScriptDesc) lblTestsScriptDesc.textContent = t.lblTestsScriptDesc;
  if (testsScriptInput) testsScriptInput.placeholder = t.testsScriptPlaceholder;

  // Generator Modal translations
  if (generatorModalSubtitle) generatorModalSubtitle.textContent = t.generatorModalSubtitle;
  if (lblGeneratorName) lblGeneratorName.textContent = t.lblGeneratorName;
  if (lblGeneratorCode) lblGeneratorCode.textContent = t.lblGeneratorCode;
  if (generatorCancelBtn) generatorCancelBtn.textContent = t.generatorCancelBtn;
  if (generatorSaveBtn) {
    const isEditGen = generatorEditIndex && parseInt(generatorEditIndex.value, 10) >= 0;
    generatorSaveBtn.textContent = isEditGen ? t.btnSaveTest : t.generatorSaveBtn;
  }
  if (summaryLabelGeneratorsCount) summaryLabelGeneratorsCount.textContent = t.summaryLabelGeneratorsCount;
  if (summaryLabelScriptStatus) summaryLabelScriptStatus.textContent = t.summaryLabelScriptStatus;

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

  // Ulearn Import translations
  const dashImportUlearnBtn = document.getElementById('dash-import-ulearn-btn');
  if (dashImportUlearnBtn && t.dashImportUlearnBtn) dashImportUlearnBtn.textContent = t.dashImportUlearnBtn;

  const ulearnModalTitle = document.getElementById('ulearn-modal-title');
  if (ulearnModalTitle && t.ulearnModalTitle) ulearnModalTitle.textContent = t.ulearnModalTitle;

  const ulearnModalSubtitle = document.getElementById('ulearn-modal-subtitle');
  if (ulearnModalSubtitle && t.ulearnModalSubtitle) {
    ulearnModalSubtitle.innerHTML = t.ulearnModalSubtitle.replace(/(https:\/\/[^\s\)]+)/g, '<code>$1</code>');
  }

  const lblUlearnUrlInput = document.getElementById('lbl-ulearn-url-input');
  if (lblUlearnUrlInput && t.lblUlearnUrlInput) lblUlearnUrlInput.textContent = t.lblUlearnUrlInput;

  const lblUlearnFetchBtn = document.getElementById('lbl-ulearn-fetch-btn');
  if (lblUlearnFetchBtn && t.lblUlearnFetchBtn) lblUlearnFetchBtn.textContent = t.lblUlearnFetchBtn;

  // Re-generate tests prompt if currently visible
  if (testsPromptOutputContainer && testsPromptOutputContainer.style.display !== 'none') {
    generateTestsPrompt();
  }

  // Re-render problems table if open to refresh translations in dynamic content
  if (loadedProblems.length > 0) {
    renderProblems(loadedProblems);
  }

  // Re-render tests table if open to refresh button tooltips and labels
  if (uploadedTests && uploadedTests.length > 0) {
    renderTestsTable();
  }

  if (typeof updateTestsBadges === 'function') {
    updateTestsBadges();
  }
  if (typeof renderGeneratorsTable === 'function') {
    renderGeneratorsTable();
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

  if (savedKey && apiKeyInput) apiKeyInput.value = savedKey;
  if (savedSecret && apiSecretInput) apiSecretInput.value = savedSecret;
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
// Multi-Language Statement Management
// ============================================================================

let multiStatements = {
  'russian': { name: '', legend: '', input: '', output: '', notes: '', tutorial: '' }
};
let activeStmtLang = 'russian';

const stmtLangNames = {
  'russian': 'Russian 🇷🇺',
  'english': 'English 🇬🇧',
  'spanish': 'Spanish 🇪🇸',
  'german': 'German 🇩🇪',
  'chinese': 'Chinese 🇨🇳',
  'french': 'French 🇫🇷',
  'kazakh': 'Kazakh 🇰🇿',
  'vietnamese': 'Vietnamese 🇻🇳',
  'uzbek': 'Uzbek 🇺🇿',
  'ukrainian': 'Ukrainian 🇺🇦',
  'tajik': 'Tajik 🇹🇯',
  'georgian': 'Georgian 🇬🇪',
  'kyrgyz': 'Kyrgyz 🇰🇬',
  'portuguese': 'Portuguese 🇵🇹',
  'japanese': 'Japanese 🇯🇵'
};

function saveActiveFormToState() {
  if (!activeStmtLang) return;
  multiStatements[activeStmtLang] = {
    name: document.getElementById('prob-name').value || '',
    legend: document.getElementById('prob-legend').value || '',
    input: document.getElementById('prob-input-format').value || '',
    output: document.getElementById('prob-output-format').value || '',
    notes: document.getElementById('prob-notes').value || '',
    tutorial: document.getElementById('prob-tutorial').value || ''
  };
}

function loadActiveFormFromState() {
  const data = multiStatements[activeStmtLang] || { name: '', legend: '', input: '', output: '', notes: '', tutorial: '' };
  document.getElementById('prob-name').value = data.name || '';
  document.getElementById('prob-legend').value = data.legend || '';
  document.getElementById('prob-input-format').value = data.input || '';
  document.getElementById('prob-output-format').value = data.output || '';
  document.getElementById('prob-notes').value = data.notes || '';
  document.getElementById('prob-tutorial').value = data.tutorial || '';
  updateStatementPreview();
}

function renderStatementLangTabs() {
  const container = document.getElementById('stmt-lang-tabs');
  if (!container) return;
  container.innerHTML = '';

  const langs = Object.keys(multiStatements);
  if (langs.length === 0) {
    multiStatements['russian'] = { name: '', legend: '', input: '', output: '', notes: '', tutorial: '' };
    activeStmtLang = 'russian';
  } else if (!multiStatements[activeStmtLang]) {
    activeStmtLang = langs[0];
  }

  Object.keys(multiStatements).forEach(lang => {
    const tabBtn = document.createElement('button');
    tabBtn.type = 'button';
    tabBtn.className = `stmt-tab ${lang === activeStmtLang ? 'active' : ''}`;
    
    const displayName = stmtLangNames[lang] || (lang.charAt(0).toUpperCase() + lang.slice(1));
    
    if (Object.keys(multiStatements).length > 1) {
      tabBtn.innerHTML = `<span>${displayName}</span><span class="close-tab" data-lang="${lang}">&times;</span>`;
    } else {
      tabBtn.innerHTML = `<span>${displayName}</span>`;
    }

    tabBtn.addEventListener('click', (e) => {
      if (e.target.classList.contains('close-tab')) {
        e.stopPropagation();
        const langToRemove = e.target.getAttribute('data-lang');
        delete multiStatements[langToRemove];
        if (activeStmtLang === langToRemove) {
          activeStmtLang = Object.keys(multiStatements)[0] || 'russian';
        }
        renderStatementLangTabs();
        loadActiveFormFromState();
        return;
      }
      if (activeStmtLang !== lang) {
        saveActiveFormToState();
        activeStmtLang = lang;
        renderStatementLangTabs();
        loadActiveFormFromState();
      }
    });

    container.appendChild(tabBtn);
  });
}

// Add Language Modal logic
const btnAddStmtLang = document.getElementById('btn-add-stmt-lang');
const addStmtLangModal = document.getElementById('add-stmt-lang-modal');
const selectNewStmtLang = document.getElementById('select-new-stmt-lang');
const addLangCancelBtn = document.getElementById('add-lang-cancel-btn');
const addLangConfirmBtn = document.getElementById('add-lang-confirm-btn');

if (btnAddStmtLang) {
  btnAddStmtLang.addEventListener('click', () => {
    if (!addStmtLangModal || !selectNewStmtLang) return;
    selectNewStmtLang.innerHTML = '';
    const addedLangs = Object.keys(multiStatements);
    Object.keys(stmtLangNames).forEach(langKey => {
      if (!addedLangs.includes(langKey)) {
        const opt = document.createElement('option');
        opt.value = langKey;
        opt.textContent = stmtLangNames[langKey];
        selectNewStmtLang.appendChild(opt);
      }
    });
    if (selectNewStmtLang.children.length === 0) {
      alert(currentLang === 'en' ? 'All supported languages have already been added.' : 'Все поддерживаемые языки уже добавлены.');
      return;
    }
    addStmtLangModal.style.display = 'flex';
  });
}

if (addLangCancelBtn) {
  addLangCancelBtn.addEventListener('click', () => {
    if (addStmtLangModal) addStmtLangModal.style.display = 'none';
  });
}

if (addLangConfirmBtn) {
  addLangConfirmBtn.addEventListener('click', () => {
    if (!selectNewStmtLang) return;
    const newLang = selectNewStmtLang.value;
    if (newLang && !multiStatements[newLang]) {
      saveActiveFormToState();
      multiStatements[newLang] = { name: '', legend: '', input: '', output: '', notes: '', tutorial: '' };
      activeStmtLang = newLang;
      renderStatementLangTabs();
      loadActiveFormFromState();
    }
    if (addStmtLangModal) addStmtLangModal.style.display = 'none';
  });
}

// Initialize tabs on page load
renderStatementLangTabs();

// ============================================================================
// LaTeX Math Equations Parser & Live Statement Preview
// ============================================================================

function renderTex(text) {
  if (!text) return '';

  const mathTokens = [];
  const codeTokens = [];

  function addMathToken(formula, isDisplay) {
    const id = `___KATEX_TOKEN_${mathTokens.length}___`;
    mathTokens.push({ formula, isDisplay });
    return id;
  }

  function addCodeToken(code, isBlock) {
    const id = `___CODE_TOKEN_${codeTokens.length}___`;
    codeTokens.push({ code, isBlock });
    return id;
  }

  // 1. Protect \begin{lstlisting} ... \end{lstlisting}
  let s = text.replace(/\\begin\{lstlisting\}([\s\S]*?)\\end\{lstlisting\}/g, (match, code) => {
    return addCodeToken(code, true);
  });

  // 2. Protect \verb|...| or \verb!...! or \verb@...@
  s = s.replace(/\\verb([\S])([\s\S]*?)\1/g, (match, delim, code) => {
    return addCodeToken(code, false);
  });

  // 3. Protect display math $$ ... $$
  s = s.replace(/\$\$([\s\S]+?)\$\$/g, (match, formula) => {
    return addMathToken(formula, true);
  });

  // 4. Protect inline math $ ... $
  s = s.replace(/\$([^\$\n]+?)\$/g, (match, formula) => {
    return addMathToken(formula, false);
  });

  // Escape HTML in non-protected text
  s = s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // 5. Epigraph \epigraph{cite}{author}
  s = s.replace(/\\epigraph\{([\s\S]*?)\}\{([\s\S]*?)\}/g, (match, cite, author) => {
    return `<blockquote class="tex-epigraph"><div class="epigraph-text">${cite}</div><div class="epigraph-author">&mdash; ${author}</div></blockquote>`;
  });

  // 6. Environments: itemize, enumerate, center, tabular
  s = s.replace(/\\begin\{itemize\}([\s\S]*?)\\end\{itemize\}/g, (match, content) => {
    const items = content.split(/\\item\s*/).filter(item => item.trim());
    const listHtml = items.map(item => `<li>${item.trim()}</li>`).join('');
    return `<ul class="tex-ul">${listHtml}</ul>`;
  });

  s = s.replace(/\\begin\{enumerate\}([\s\S]*?)\\end\{enumerate\}/g, (match, content) => {
    const items = content.split(/\\item\s*/).filter(item => item.trim());
    const listHtml = items.map(item => `<li>${item.trim()}</li>`).join('');
    return `<ol class="tex-ol">${listHtml}</ol>`;
  });

  s = s.replace(/\\begin\{center\}([\s\S]*?)\\end\{center\}/g, (match, content) => {
    return `<div class="tex-center">${content}</div>`;
  });

  s = s.replace(/\\begin\{tabular\}\{([^}]*)\}([\s\S]*?)\\end\{tabular\}/g, (match, cols, content) => {
    const rows = content.split(/\\\\/).map(r => r.trim()).filter(r => r && r !== '\\hline');
    let tableHtml = '<table class="tex-table">';
    rows.forEach(row => {
      let cleanRow = row.replace(/\\hline/g, '').trim();
      if (!cleanRow) return;
      const cells = cleanRow.split('&').map(c => {
        let cellText = c.trim();
        cellText = cellText.replace(/\\multicolumn\{(\d+)\}\{[^}]*\}\{([^}]*)\}/g, (m, span, text) => {
          return `<td colspan="${span}">${text}</td>`;
        });
        if (cellText.startsWith('<td')) return cellText;
        return `<td>${cellText}</td>`;
      });
      tableHtml += `<tr>${cells.join('')}</tr>`;
    });
    tableHtml += '</table>';
    return tableHtml;
  });

  // 7. Typography & Quotes
  s = s.replace(/&lt;&lt;([\s\S]*?)&gt;&gt;/g, '«$1»');
  s = s.replace(/``([\s\S]*?)''/g, '“$1”');
  s = s.replace(/`([^']+)'/g, '‘$1’');
  s = s.replace(/~---/g, '&nbsp;&mdash;');
  s = s.replace(/~--/g, '&nbsp;&mdash;');
  s = s.replace(/"---/g, '&mdash;');
  s = s.replace(/---/g, '&mdash;');
  s = s.replace(/--/g, '&ndash;');
  s = s.replace(/\\~/g, '~');
  s = s.replace(/~/g, '&nbsp;');
  s = s.replace(/\\\s/g, '&nbsp;');

  // 8. Text Formatting Commands
  s = s.replace(/\\textbf\{([\s\S]*?)\}/g, '<strong>$1</strong>');
  s = s.replace(/\\bf\{([\s\S]*?)\}/g, '<strong>$1</strong>');
  s = s.replace(/\{\\bf\s+([\s\S]*?)\}/g, '<strong>$1</strong>');

  s = s.replace(/\\textit\{([\s\S]*?)\}/g, '<em>$1</em>');
  s = s.replace(/\\it\{([\s\S]*?)\}/g, '<em>$1</em>');
  s = s.replace(/\{\\it\s+([\s\S]*?)\}/g, '<em>$1</em>');
  s = s.replace(/\\emph\{([\s\S]*?)\}/g, '<em>$1</em>');

  s = s.replace(/\\t\{([\s\S]*?)\}/g, '<code class="tex-code">$1</code>');
  s = s.replace(/\\texttt\{([\s\S]*?)\}/g, '<code class="tex-code">$1</code>');
  s = s.replace(/\\tt\{([\s\S]*?)\}/g, '<code class="tex-code">$1</code>');
  s = s.replace(/\{\\tt\s+([\s\S]*?)\}/g, '<code class="tex-code">$1</code>');

  s = s.replace(/\\underline\{([\s\S]*?)\}/g, '<u>$1</u>');
  s = s.replace(/\\sout\{([\s\S]*?)\}/g, '<del>$1</del>');
  s = s.replace(/\\textsc\{([\s\S]*?)\}/g, '<span style="font-variant: small-caps;">$1</span>');

  // 9. Font Sizes
  s = s.replace(/\\tiny\{([\s\S]*?)\}/g, '<span style="font-size:0.7em;">$1</span>');
  s = s.replace(/\{\\tiny\s+([\s\S]*?)\}/g, '<span style="font-size:0.7em;">$1</span>');
  s = s.replace(/\\scriptsize\{([\s\S]*?)\}/g, '<span style="font-size:0.75em;">$1</span>');
  s = s.replace(/\{\\scriptsize\s+([\s\S]*?)\}/g, '<span style="font-size:0.75em;">$1</span>');
  s = s.replace(/\\small\{([\s\S]*?)\}/g, '<span style="font-size:0.85em;">$1</span>');
  s = s.replace(/\{\\small\s+([\s\S]*?)\}/g, '<span style="font-size:0.85em;">$1</span>');
  s = s.replace(/\\large\{([\s\S]*?)\}/g, '<span style="font-size:1.15em;">$1</span>');
  s = s.replace(/\{\\large\s+([\s\S]*?)\}/g, '<span style="font-size:1.15em;">$1</span>');
  s = s.replace(/\\Large\{([\s\S]*?)\}/g, '<span style="font-size:1.3em;">$1</span>');
  s = s.replace(/\{\\Large\s+([\s\S]*?)\}/g, '<span style="font-size:1.3em;">$1</span>');
  s = s.replace(/\\LARGE\{([\s\S]*?)\}/g, '<span style="font-size:1.45em;">$1</span>');
  s = s.replace(/\{\\LARGE\s+([\s\S]*?)\}/g, '<span style="font-size:1.45em;">$1</span>');
  s = s.replace(/\\huge\{([\s\S]*?)\}/g, '<span style="font-size:1.75em;">$1</span>');
  s = s.replace(/\{\\huge\s+([\s\S]*?)\}/g, '<span style="font-size:1.75em;">$1</span>');
  s = s.replace(/\\Huge\{([\s\S]*?)\}/g, '<span style="font-size:2em;">$1</span>');
  s = s.replace(/\{\\Huge\s+([\s\S]*?)\}/g, '<span style="font-size:2em;">$1</span>');

  // 10. Links and Images
  s = s.replace(/\\href\{([^}]+)\}\{([^}]+)\}/g, '<a href="$1" target="_blank" rel="noopener">$2</a>');
  s = s.replace(/\\url\{([^}]+)\}/g, '<a href="$1" target="_blank" rel="noopener">$1</a>');
  s = s.replace(/\\includegraphics(?:\[[^\]]*\])?\{([^}]+)\}/g, '<img src="$1" alt="$1" class="tex-img" />');

  // Newlines handling
  s = s.replace(/\n\n+/g, '</p><p>');
  s = s.replace(/\n/g, '<br>');

  // Restore Code Tokens
  codeTokens.forEach((token, index) => {
    const placeholder = `___CODE_TOKEN_${index}___`;
    const escapedCode = token.code.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const html = token.isBlock
      ? `<pre class="tex-listing"><code>${escapedCode}</code></pre>`
      : `<code class="tex-code">${escapedCode}</code>`;
    s = s.replace(placeholder, html);
  });

  // Restore KaTeX Math Tokens
  mathTokens.forEach((token, index) => {
    const placeholder = `___KATEX_TOKEN_${index}___`;
    let html = '';
    try {
      html = katex.renderToString(token.formula, {
        displayMode: token.isDisplay,
        throwOnError: false
      });
    } catch (e) {
      console.warn('KaTeX render error:', e);
      html = `<span class="math-expr">${token.formula}</span>`;
    }
    s = s.replace(placeholder, html);
  });

  return s;
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

  document.getElementById('preview-legend').innerHTML = renderTex(legendVal);
  document.getElementById('preview-input-format').innerHTML = renderTex(inputVal);
  document.getElementById('preview-output-format').innerHTML = renderTex(outputVal);

  const notesSection = document.getElementById('preview-notes-section');
  if (notesVal.trim() !== '') {
    notesSection.style.display = 'block';
    document.getElementById('preview-notes').innerHTML = renderTex(notesVal);
  } else {
    notesSection.style.display = 'none';
  }

  const tutorialSection = document.getElementById('preview-tutorial-section');
  if (tutorialVal.trim() !== '') {
    tutorialSection.style.display = 'block';
    document.getElementById('preview-tutorial').innerHTML = renderTex(tutorialVal);
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
    el.addEventListener('input', () => {
      saveActiveFormToState();
      updateStatementPreview();
    });
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
      multiStatements = {
        'russian': { name: '', legend: '', input: '', output: '', notes: '', tutorial: '' }
      };
      activeStmtLang = 'russian';
      updateWizardTitleForEdit();
      renderTestsTable();
      renderStatementLangTabs();

      // Prefill fields with empty/default values
      document.getElementById('prob-name').value = '';
      document.getElementById('prob-system-name').value = '';
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

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

let draggedTestIdx = null;

function renderTestsTable() {
  if (!testsTableBody || !testsListContainer) return;

  if (typeof updateTestsBadges === 'function') {
    updateTestsBadges();
  }

  if (uploadedTests.length === 0) {
    testsListContainer.style.display = 'none';
    return;
  }

  testsListContainer.style.display = 'block';
  testsTableBody.innerHTML = '';
  const t = translations[currentLang];

  uploadedTests.forEach((test, idx) => {
    const tr = document.createElement('tr');
    tr.className = 'test-row';
    tr.setAttribute('draggable', 'true');
    tr.dataset.idx = idx;

    const checkedAttr = test.useInStatements ? 'checked' : '';
    const isFirst = idx === 0;
    const isLast = idx === uploadedTests.length - 1;

    tr.innerHTML = `
      <td class="col-order" style="text-align: center; width: 55px; white-space: nowrap;">
        <span class="drag-handle" title="${t.dragToReorder || 'Drag to reorder'}">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="9" cy="5" r="1"></circle><circle cx="9" cy="12" r="1"></circle><circle cx="9" cy="19" r="1"></circle>
            <circle cx="15" cy="5" r="1"></circle><circle cx="15" cy="12" r="1"></circle><circle cx="15" cy="19" r="1"></circle>
          </svg>
        </span>
        <span class="test-order-badge">${idx + 1}</span>
      </td>
      <td class="col-name font-medium">${escapeHtml(test.name)}</td>
      <td class="col-size" style="color: var(--text-secondary);">${formatBytes(test.size)}</td>
      <td class="col-statements" style="text-align: center;">
        <div class="tests-checkbox-container">
          <input type="checkbox" class="tests-checkbox" data-idx="${idx}" ${checkedAttr}>
        </div>
      </td>
      <td class="col-actions" style="text-align: right;">
        <div class="test-actions-group">
          <button type="button" class="btn-icon-action btn-move-up" data-idx="${idx}" title="${t.btnMoveUp || 'Move Up'}" ${isFirst ? 'disabled' : ''}>
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="18 15 12 9 6 15"></polyline>
            </svg>
          </button>
          <button type="button" class="btn-icon-action btn-move-down" data-idx="${idx}" title="${t.btnMoveDown || 'Move Down'}" ${isLast ? 'disabled' : ''}>
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </button>
          <button type="button" class="btn-icon-action btn-edit-test" data-idx="${idx}" title="${t.btnEditTest || 'Edit'}">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
          </button>
          <button type="button" class="btn-icon-action btn-delete-test text-red" data-idx="${idx}" title="${t.btnRemove || 'Remove'}">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
          </button>
        </div>
      </td>
    `;

    // Row drag and drop listeners
    tr.addEventListener('dragstart', (e) => {
      draggedTestIdx = idx;
      tr.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', String(idx));
    });

    tr.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      tr.classList.add('drag-over');
    });

    tr.addEventListener('dragleave', () => {
      tr.classList.remove('drag-over');
    });

    tr.addEventListener('drop', (e) => {
      e.preventDefault();
      tr.classList.remove('drag-over');
      if (draggedTestIdx !== null && draggedTestIdx !== idx) {
        const movedItem = uploadedTests.splice(draggedTestIdx, 1)[0];
        uploadedTests.splice(idx, 0, movedItem);
        draggedTestIdx = null;
        renderTestsTable();
      }
    });

    tr.addEventListener('dragend', () => {
      tr.classList.remove('dragging');
      draggedTestIdx = null;
    });

    testsTableBody.appendChild(tr);
  });

  // Bind checkbox changes
  testsTableBody.querySelectorAll('.tests-checkbox').forEach(cb => {
    cb.addEventListener('change', (e) => {
      const idx = parseInt(e.target.getAttribute('data-idx'), 10);
      if (uploadedTests[idx]) {
        uploadedTests[idx].useInStatements = e.target.checked;
      }
    });
  });

  // Bind move up
  testsTableBody.querySelectorAll('.btn-move-up').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const idx = parseInt(e.currentTarget.getAttribute('data-idx'), 10);
      moveTestUp(idx);
    });
  });

  // Bind move down
  testsTableBody.querySelectorAll('.btn-move-down').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const idx = parseInt(e.currentTarget.getAttribute('data-idx'), 10);
      moveTestDown(idx);
    });
  });

  // Bind edit
  testsTableBody.querySelectorAll('.btn-edit-test').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const idx = parseInt(e.currentTarget.getAttribute('data-idx'), 10);
      openManualTestModal(idx);
    });
  });

  // Bind delete test buttons
  testsTableBody.querySelectorAll('.btn-delete-test').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const idx = parseInt(e.currentTarget.getAttribute('data-idx'), 10);
      uploadedTests.splice(idx, 1);
      renderTestsTable();
    });
  });
}

function moveTestUp(idx) {
  if (idx > 0 && idx < uploadedTests.length) {
    const temp = uploadedTests[idx];
    uploadedTests[idx] = uploadedTests[idx - 1];
    uploadedTests[idx - 1] = temp;
    renderTestsTable();
  }
}

function moveTestDown(idx) {
  if (idx >= 0 && idx < uploadedTests.length - 1) {
    const temp = uploadedTests[idx];
    uploadedTests[idx] = uploadedTests[idx + 1];
    uploadedTests[idx + 1] = temp;
    renderTestsTable();
  }
}

// Manual Test Modal Handlers
function openManualTestModal(editIdx = -1) {
  const isEdit = editIdx >= 0 && editIdx < uploadedTests.length;
  const t = translations[currentLang];

  if (manualTestEditIndex) manualTestEditIndex.value = editIdx.toString();
  if (manualTestModalTitle) manualTestModalTitle.textContent = isEdit ? t.modalEditTestTitle : t.modalAddTestTitle;
  if (manualTestSaveBtn) manualTestSaveBtn.textContent = isEdit ? t.btnSaveTest : t.modalAddTestBtn;

  if (isEdit) {
    const test = uploadedTests[editIdx];
    if (manualTestName) manualTestName.value = test.name || '';
    if (manualTestInput) manualTestInput.value = test.content || '';
    if (manualTestOutput) manualTestOutput.value = test.answer || '';
    if (manualTestStatements) manualTestStatements.checked = !!test.useInStatements;
  } else {
    const defaultName = `test${uploadedTests.length + 1}.txt`;
    if (manualTestName) manualTestName.value = defaultName;
    if (manualTestInput) manualTestInput.value = '';
    if (manualTestOutput) manualTestOutput.value = '';
    if (manualTestStatements) manualTestStatements.checked = uploadedTests.length < 2;
  }

  [manualTestName, manualTestInput, manualTestOutput].forEach(el => {
    if (el) el.dispatchEvent(new Event('input'));
  });

  if (manualTestModal) {
    manualTestModal.style.display = 'flex';
  }
  if (manualTestInput) {
    setTimeout(() => manualTestInput.focus(), 60);
  }
}

function closeManualTestModal() {
  if (manualTestModal) {
    manualTestModal.style.display = 'none';
  }
}

function saveManualTest() {
  const t = translations[currentLang];
  const editIdx = manualTestEditIndex ? parseInt(manualTestEditIndex.value, 10) : -1;
  const isEdit = editIdx >= 0 && editIdx < uploadedTests.length;

  const contentVal = manualTestInput ? manualTestInput.value : '';
  const answerVal = manualTestOutput ? manualTestOutput.value : '';
  let nameVal = manualTestName ? manualTestName.value.trim() : '';

  if (!contentVal.trim()) {
    showCustomAlert(t.testInputRequiredAlert);
    if (manualTestInput) manualTestInput.focus();
    return;
  }

  if (!nameVal) {
    nameVal = isEdit ? uploadedTests[editIdx].name : `test${uploadedTests.length + 1}.txt`;
  }

  const encoder = new TextEncoder();
  const byteSize = encoder.encode(contentVal).length;
  const useInStatements = manualTestStatements ? manualTestStatements.checked : false;

  if (isEdit) {
    uploadedTests[editIdx] = {
      ...uploadedTests[editIdx],
      name: nameVal,
      content: contentVal,
      answer: answerVal,
      size: byteSize,
      useInStatements: useInStatements
    };
  } else {
    uploadedTests.push({
      name: nameVal,
      content: contentVal,
      answer: answerVal,
      size: byteSize,
      useInStatements: useInStatements
    });
  }

  closeManualTestModal();
  renderTestsTable();
}

if (btnAddManualTest) {
  applyRippleEffect(btnAddManualTest);
  btnAddManualTest.addEventListener('click', () => openManualTestModal(-1));
}
if (btnAddManualTestTable) {
  applyRippleEffect(btnAddManualTestTable);
  btnAddManualTestTable.addEventListener('click', () => openManualTestModal(-1));
}
if (manualTestModalClose) {
  manualTestModalClose.addEventListener('click', closeManualTestModal);
}
if (manualTestCancelBtn) {
  manualTestCancelBtn.addEventListener('click', closeManualTestModal);
}
if (manualTestSaveBtn) {
  manualTestSaveBtn.addEventListener('click', saveManualTest);
}
if (manualTestModal) {
  manualTestModal.addEventListener('click', (e) => {
    if (e.target === manualTestModal) {
      closeManualTestModal();
    }
  });
}

// ============================================================================
// Test Generator & Script Implementation
// ============================================================================

function switchTestsTab(mode) {
  activeTestsTab = mode;
  if (mode === 'generator') {
    if (tabBtnGeneratorTests) tabBtnGeneratorTests.classList.add('active');
    if (tabBtnManualTests) tabBtnManualTests.classList.remove('active');
    if (sectionGeneratorTests) sectionGeneratorTests.style.display = 'block';
    if (sectionManualTests) sectionManualTests.style.display = 'none';
  } else {
    if (tabBtnManualTests) tabBtnManualTests.classList.add('active');
    if (tabBtnGeneratorTests) tabBtnGeneratorTests.classList.remove('active');
    if (sectionManualTests) sectionManualTests.style.display = 'block';
    if (sectionGeneratorTests) sectionGeneratorTests.style.display = 'none';
  }
}

if (tabBtnManualTests) {
  tabBtnManualTests.addEventListener('click', () => switchTestsTab('manual'));
}
if (tabBtnGeneratorTests) {
  tabBtnGeneratorTests.addEventListener('click', () => switchTestsTab('generator'));
}

function updateTestsBadges() {
  if (badgeManualTestsCount) {
    badgeManualTestsCount.textContent = (uploadedTests ? uploadedTests.length : 0).toString();
  }
  if (badgeGeneratorTestsCount) {
    badgeGeneratorTestsCount.textContent = (problemGenerators ? problemGenerators.length : 0).toString();
  }
}

function renderGeneratorsTable() {
  if (!generatorsTableBody || !generatorsListContainer) return;

  updateTestsBadges();

  if (!problemGenerators || problemGenerators.length === 0) {
    generatorsListContainer.style.display = 'none';
    return;
  }

  generatorsListContainer.style.display = 'block';
  generatorsTableBody.innerHTML = '';
  const t = translations[currentLang];

  problemGenerators.forEach((gen, idx) => {
    const tr = document.createElement('tr');
    tr.className = 'generator-row';

    const fileSize = gen.size || (gen.content ? new TextEncoder().encode(gen.content).length : 0);

    tr.innerHTML = `
      <td class="col-order" style="text-align: center; width: 55px; white-space: nowrap;">
        <span class="test-order-badge">${idx + 1}</span>
      </td>
      <td class="col-name font-medium">${escapeHtml(gen.name)}</td>
      <td class="col-size" style="color: var(--text-secondary);">${formatBytes(fileSize)}</td>
      <td class="col-actions" style="text-align: right; width: 180px;">
        <div class="test-actions-group" style="justify-content: flex-end;">
          <button type="button" class="btn-icon-action btn-download-gen" data-idx="${idx}" title="${t.btnDownloadGen || 'Download file'}">
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
          </button>
          <button type="button" class="btn-icon-action btn-edit-gen" data-idx="${idx}" title="${t.btnEditGen || 'Edit code'}">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
          </button>
          <button type="button" class="btn-icon-action btn-delete-gen text-red" data-idx="${idx}" title="${t.btnDeleteGen || 'Remove'}">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
          </button>
        </div>
      </td>
    `;

    generatorsTableBody.appendChild(tr);
  });

  // Action listeners
  generatorsTableBody.querySelectorAll('.btn-download-gen').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const idx = parseInt(e.currentTarget.getAttribute('data-idx'), 10);
      downloadGeneratorFile(idx);
    });
  });

  generatorsTableBody.querySelectorAll('.btn-edit-gen').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const idx = parseInt(e.currentTarget.getAttribute('data-idx'), 10);
      openGeneratorModal(idx);
    });
  });

  generatorsTableBody.querySelectorAll('.btn-delete-gen').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const idx = parseInt(e.currentTarget.getAttribute('data-idx'), 10);
      if (idx >= 0 && idx < problemGenerators.length) {
        problemGenerators.splice(idx, 1);
        renderGeneratorsTable();
      }
    });
  });
}

function downloadGeneratorFile(idx) {
  const gen = problemGenerators[idx];
  if (!gen) return;
  const content = gen.content || '';
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = gen.name || 'generator.cpp';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

if (generatorDropZone) {
  generatorDropZone.addEventListener('click', () => generatorFileInput.click());

  generatorDropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    generatorDropZone.classList.add('drop-zone--over');
  });

  ['dragleave', 'dragend'].forEach(type => {
    generatorDropZone.addEventListener(type, () => {
      generatorDropZone.classList.remove('drop-zone--over');
    });
  });

  generatorDropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    generatorDropZone.classList.remove('drop-zone--over');
    if (e.dataTransfer.files.length) {
      handleGeneratorFiles(e.dataTransfer.files);
    }
  });
}

if (generatorFileInput) {
  generatorFileInput.addEventListener('change', () => {
    if (generatorFileInput.files.length) {
      handleGeneratorFiles(generatorFileInput.files);
    }
  });
}

function handleGeneratorFiles(files) {
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const existingIdx = problemGenerators.findIndex(g => g.name === file.name);
    const genObj = {
      name: file.name,
      size: file.size,
      content: ''
    };

    if (existingIdx >= 0) {
      problemGenerators[existingIdx] = genObj;
    } else {
      problemGenerators.push(genObj);
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      genObj.content = e.target.result;
      genObj.size = new TextEncoder().encode(genObj.content).length;
      renderGeneratorsTable();
    };
    reader.readAsText(file);
  }

  setTimeout(() => {
    renderGeneratorsTable();
  }, 100);
}

function openGeneratorModal(idx = -1) {
  const t = translations[currentLang];
  const isEdit = idx >= 0 && idx < problemGenerators.length;
  if (generatorEditIndex) generatorEditIndex.value = idx.toString();

  if (isEdit) {
    const gen = problemGenerators[idx];
    if (generatorModalTitle) generatorModalTitle.textContent = t.generatorModalTitleEdit;
    if (generatorName) generatorName.value = gen.name;
    if (generatorCode) generatorCode.value = gen.content || '';
    if (generatorSaveBtn) generatorSaveBtn.textContent = t.btnSaveTest;
  } else {
    if (generatorModalTitle) generatorModalTitle.textContent = t.generatorModalTitleAdd;
    const defaultName = `gen${problemGenerators.length > 0 ? problemGenerators.length + 1 : ''}.cpp`;
    if (generatorName) generatorName.value = defaultName;
    if (generatorCode) generatorCode.value = '';
    if (generatorSaveBtn) generatorSaveBtn.textContent = t.generatorSaveBtn;
  }

  if (generatorModal) {
    generatorModal.style.display = 'flex';
    requestAnimationFrame(() => {
      generatorModal.classList.add('visible');
      if (generatorCode) generatorCode.focus();
    });
  }
}

function closeGeneratorModal() {
  if (!generatorModal) return;
  generatorModal.classList.remove('visible');
  setTimeout(() => {
    generatorModal.style.display = 'none';
  }, 200);
}

async function saveGeneratorModal() {
  const t = translations[currentLang];
  const editIdx = generatorEditIndex ? parseInt(generatorEditIndex.value, 10) : -1;
  const isEdit = editIdx >= 0 && editIdx < problemGenerators.length;

  let nameVal = (generatorName?.value || '').trim();
  const codeVal = generatorCode?.value || '';

  if (!nameVal) {
    await showCustomAlert(t.genFileNameRequired, currentLang === 'en' ? 'Validation Error' : 'Ошибка валидации');
    if (generatorName) generatorName.focus();
    return;
  }

  if (!codeVal.trim()) {
    await showCustomAlert(t.genCodeRequired, currentLang === 'en' ? 'Validation Error' : 'Ошибка валидации');
    if (generatorCode) generatorCode.focus();
    return;
  }

  const dupIdx = problemGenerators.findIndex((g, i) => g.name.toLowerCase() === nameVal.toLowerCase() && i !== editIdx);
  if (dupIdx >= 0) {
    await showCustomAlert(t.genFileAlreadyExists(nameVal), currentLang === 'en' ? 'Duplicate Filename' : 'Дубликат имени файла');
    if (generatorName) generatorName.focus();
    return;
  }

  const byteSize = new TextEncoder().encode(codeVal).length;

  if (isEdit) {
    problemGenerators[editIdx] = {
      name: nameVal,
      content: codeVal,
      size: byteSize
    };
  } else {
    problemGenerators.push({
      name: nameVal,
      content: codeVal,
      size: byteSize
    });
  }

  closeGeneratorModal();
  renderGeneratorsTable();
}

if (btnAddGeneratorCode) {
  btnAddGeneratorCode.addEventListener('click', () => openGeneratorModal(-1));
}
if (generatorModalClose) {
  generatorModalClose.addEventListener('click', closeGeneratorModal);
}
if (generatorCancelBtn) {
  generatorCancelBtn.addEventListener('click', closeGeneratorModal);
}
if (generatorSaveBtn) {
  generatorSaveBtn.addEventListener('click', saveGeneratorModal);
}
if (generatorModal) {
  generatorModal.addEventListener('click', (e) => {
    if (e.target === generatorModal) {
      closeGeneratorModal();
    }
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
  if (summaryValGeneratorsCount) {
    summaryValGeneratorsCount.textContent = (problemGenerators ? problemGenerators.length : 0).toString();
  }
  if (summaryValScriptStatus) {
    const hasScript = testsScriptInput && testsScriptInput.value.trim().length > 0;
    const t = translations[currentLang];
    summaryValScriptStatus.textContent = hasScript ? (t.summaryScriptConfigured || 'Configured') : (t.summaryScriptNone || 'None');
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

  // 3. problem.saveStatement for ALL statement languages in multiStatements
  saveActiveFormToState();
  const stmtLangs = Object.keys(multiStatements);
  for (let i = 0; i < stmtLangs.length; i++) {
    const langCode = stmtLangs[i];
    const stmtData = multiStatements[langCode];
    addUploadLog(t.logSavingStatement(langCode), 'info');
    const stmtRes = await callPolygonApi('problem.saveStatement', {
      problemId: problemId,
      lang: langCode,
      name: stmtData.name || nameVal,
      legend: stmtData.legend || '',
      input: stmtData.input || '',
      output: stmtData.output || '',
      notes: stmtData.notes || '',
      tutorial: stmtData.tutorial || ''
    }, apiKey, apiSecret);
    if (stmtRes.status !== 'OK') {
      throw new Error(stmtRes.comment || `Failed to save ${langCode} statement`);
    }
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
    if (uploadProgressBar) uploadProgressBar.style.width = '88%';
  }

  // 6b. problem.saveFile (test generators)
  if (problemGenerators && problemGenerators.length > 0) {
    addUploadLog(t.logUploadingGenerators(problemGenerators.length), 'info');
    for (let i = 0; i < problemGenerators.length; i++) {
      const gen = problemGenerators[i];
      const genRes = await callPolygonApi('problem.saveFile', {
        problemId: problemId,
        type: 'source',
        name: gen.name,
        file: gen.content || ''
      }, apiKey, apiSecret);
      if (genRes.status !== 'OK') {
        throw new Error(genRes.comment || `Failed to upload generator ${gen.name}`);
      }
      addUploadLog(t.logGeneratorUploaded(gen.name), 'success');
    }
  }

  // 6c. problem.saveScript (tests generation script)
  const scriptContent = testsScriptInput ? testsScriptInput.value.trim() : '';
  if (scriptContent) {
    addUploadLog(t.logSavingScript, 'info');
    const scriptRes = await callPolygonApi('problem.saveScript', {
      problemId: problemId,
      testset: 'tests',
      source: scriptContent
    }, apiKey, apiSecret);
    if (scriptRes.status !== 'OK') {
      throw new Error(scriptRes.comment || 'Failed to save tests generation script');
    }
    addUploadLog(t.logScriptSaved, 'success');
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
  if (uploadProgressBar) uploadProgressBar.style.width = '90%';

  // 8. problem.buildPackage
  addUploadLog(t.logBuildingPackage, 'info');
  try {
    const buildRes = await callPolygonApi('problem.buildPackage', {
      problemId: problemId,
      full: 'true',
      verify: 'true'
    }, apiKey, apiSecret);
    if (buildRes.status === 'OK') {
      addUploadLog(t.logPackageBuilt, 'success');
    } else {
      addUploadLog(currentLang === 'en' ? `Package build note: ${buildRes.comment}` : `Примечание сборки пакета: ${buildRes.comment}`, 'warning');
    }
  } catch (buildErr) {
    console.warn('Package build error:', buildErr);
    addUploadLog(currentLang === 'en' ? `Package build note: ${buildErr.message}` : `Примечание сборки пакета: ${buildErr.message}`, 'warning');
  }

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

    // Populate multiStatements from Polygon API response
    multiStatements = {};
    if (statementsRes.result && typeof statementsRes.result === 'object' && !Array.isArray(statementsRes.result)) {
      for (const [lang, stmt] of Object.entries(statementsRes.result)) {
        if (!stmt || typeof stmt !== 'object') continue;
        const normalizedLang = String(lang).toLowerCase().trim();
        multiStatements[normalizedLang] = {
          name: stmt.name || '',
          legend: stmt.legend || '',
          input: stmt.input || '',
          output: stmt.output || '',
          notes: stmt.notes || '',
          tutorial: stmt.tutorial || ''
        };
      }
    }

    if (Object.keys(multiStatements).length === 0) {
      const defaultLang = currentLang === 'en' ? 'english' : 'russian';
      multiStatements[defaultLang] = { name: '', legend: '', input: '', output: '', notes: '', tutorial: '' };
    }

    // Determine active statement language:
    // Prefer user's interface language if present in statements,
    // otherwise fallback to 'russian', then 'english', then the first available statement language
    const availableLangs = Object.keys(multiStatements);
    const preferredLang = currentLang === 'en' ? 'english' : 'russian';
    if (availableLangs.includes(preferredLang)) {
      activeStmtLang = preferredLang;
    } else if (availableLangs.includes('russian')) {
      activeStmtLang = 'russian';
    } else if (availableLangs.includes('english')) {
      activeStmtLang = 'english';
    } else {
      activeStmtLang = availableLangs[0] || 'russian';
    }

    renderStatementLangTabs();
    loadActiveFormFromState();

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
    lastFetchedStatement = (statementsRes.result && statementsRes.result[activeStmtLang])
      || (statementsRes.result && typeof statementsRes.result === 'object' && Object.values(statementsRes.result)[0])
      || null;

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

    // 5b. Get generators and test generation script
    problemGenerators = [];
    let loadedScript = '';
    try {
      const filesRes = await callPolygonApi('problem.files', { problemId: probId }, apiKey, apiSecret);
      if (filesRes.status === 'OK' && filesRes.result && Array.isArray(filesRes.result.sourceFiles)) {
        const excludeNames = new Set();
        if (checkerName) excludeNames.add(checkerName.toLowerCase().trim());

        try {
          const valRes = await callPolygonApi('problem.validator', { problemId: probId }, apiKey, apiSecret);
          if (valRes.status === 'OK' && valRes.result) {
            excludeNames.add(valRes.result.toLowerCase().trim());
          }
        } catch (_) {}

        try {
          const interactorRes = await callPolygonApi('problem.interactor', { problemId: probId }, apiKey, apiSecret);
          if (interactorRes.status === 'OK' && interactorRes.result) {
            excludeNames.add(interactorRes.result.toLowerCase().trim());
          }
        } catch (_) {}

        const genSourceFiles = filesRes.result.sourceFiles.filter(sf => sf.name && !excludeNames.has(sf.name.toLowerCase().trim()));

        const genPromises = genSourceFiles.map(async (sf) => {
          try {
            const content = await downloadPlainFile('problem.viewFile', {
              problemId: probId,
              type: 'source',
              name: sf.name
            }, apiKey, apiSecret);
            return {
              name: sf.name,
              size: content.length,
              content: content
            };
          } catch (e) {
            console.warn(`Failed to fetch generator ${sf.name}:`, e);
            return null;
          }
        });

        const downloadedGens = await Promise.all(genPromises);
        problemGenerators = downloadedGens.filter(Boolean);
      }
    } catch (genErr) {
      console.warn('Failed to load generators:', genErr);
    }

    try {
      const scriptContent = await downloadPlainFile('problem.script', {
        problemId: probId,
        testset: 'tests'
      }, apiKey, apiSecret);
      loadedScript = scriptContent || '';
    } catch (scErr) {
      console.warn('Failed to load test script:', scErr);
    }

    if (testsScriptInput) {
      testsScriptInput.value = loadedScript;
    }

    // Pre-populate Step 1 general info & limits
    const matchedProb = loadedProblems.find(p => String(p.id) === String(probId));
    const sysNameEl = document.getElementById('prob-system-name');
    if (sysNameEl) {
      sysNameEl.value = (matchedProb && matchedProb.name) || '';
    }

    const timeLimitEl = document.getElementById('prob-time-limit');
    if (timeLimitEl) {
      timeLimitEl.value = (infoRes.result && infoRes.result.timeLimit) || 1000;
    }

    const memLimitEl = document.getElementById('prob-memory-limit');
    if (memLimitEl) {
      memLimitEl.value = (infoRes.result && infoRes.result.memoryLimit) || 256;
    }

    // Dispatch input events
    ['prob-name', 'prob-system-name', 'prob-time-limit', 'prob-memory-limit', 'prob-legend', 'prob-input-format', 'prob-output-format', 'prob-notes', 'prob-tutorial'].forEach(id => {
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
    renderGeneratorsTable();
    switchTestsTab('manual');
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
  lastFetchedStatement = null;

  multiStatements = {
    'russian': { name: '', legend: '', input: '', output: '', notes: '', tutorial: '' }
  };
  activeStmtLang = 'russian';
  renderStatementLangTabs();

  const probNameInput = document.getElementById('prob-name');
  const probSysNameInput = document.getElementById('prob-system-name');
  const probTimeInput = document.getElementById('prob-time-limit');
  const probMemInput = document.getElementById('prob-memory-limit');
  const probLegendInput = document.getElementById('prob-legend');
  const probInputFormat = document.getElementById('prob-input-format');
  const probOutputFormat = document.getElementById('prob-output-format');
  const probNotes = document.getElementById('prob-notes');
  const probTutorial = document.getElementById('prob-tutorial');

  if (probNameInput) probNameInput.value = '';
  if (probSysNameInput) probSysNameInput.value = '';
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

  problemGenerators = [];
  if (testsScriptInput) testsScriptInput.value = '';

  updateStatementPreview();
  renderTestsTable();
  renderGeneratorsTable();
  switchTestsTab('manual');

  if (promptOutputContainer) promptOutputContainer.style.display = 'none';
  if (testsPromptOutputContainer) testsPromptOutputContainer.style.display = 'none';
  if (accordionToggleBtn) accordionToggleBtn.setAttribute('aria-expanded', 'false');
  if (accordionContent) accordionContent.style.maxHeight = '0px';
  if (accordionTestsToggleBtn) accordionTestsToggleBtn.setAttribute('aria-expanded', 'false');
  if (accordionTestsContent) accordionTestsContent.style.maxHeight = '0px';

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

// ============================================================================
// Pythontutor Web Archive Task Importer
// ============================================================================

const importPtBtn = document.getElementById('import-pt-btn');
const ptImportModal = document.getElementById('pt-import-modal');
const ptModalClose = document.getElementById('pt-modal-close');
const ptCancelBtn = document.getElementById('pt-cancel-btn');
const ptFetchBtn = document.getElementById('pt-fetch-btn');
const ptUrlInput = document.getElementById('pt-url-input');
const ptStatusAlert = document.getElementById('pt-status-alert');
const ptStatusMsg = document.getElementById('pt-status-msg');
const ptBtnSpinner = document.getElementById('pt-btn-spinner');

function openPtModal() {
  if (ptStatusAlert) ptStatusAlert.style.display = 'none';
  if (ptImportModal) ptImportModal.style.display = 'flex';
}

function closePtModal() {
  if (ptImportModal) ptImportModal.style.display = 'none';
}

if (importPtBtn) {
  applyRippleEffect(importPtBtn);
  importPtBtn.addEventListener('click', openPtModal);
}
if (ptModalClose) ptModalClose.addEventListener('click', closePtModal);
if (ptCancelBtn) ptCancelBtn.addEventListener('click', closePtModal);

function parseHtmlEntities(str) {
  const txt = document.createElement('textarea');
  txt.innerHTML = str;
  return txt.value;
}

const PT_DEFAULT_LESSONS = [
  'for_loop',
  'inout_and_arithmetic_operations',
  'ifelse',
  'int_and_float',
  'str',
  'while',
  'lists',
  'functions',
  '2d_arrays',
  'sets',
  'dicts'
];

async function fetchPythontutorHtml(inputVal) {
  let raw = (inputVal || '').trim();
  if (!raw) {
    throw new Error(currentLang === 'en' ? 'Please enter a URL or problem slug.' : 'Пожалуйста, введите ссылку или название задачи.');
  }

  let fetchUrl = '';

  if (raw.includes('web.archive.org')) {
    fetchUrl = raw.replace(/^https?:\/\/web\.archive\.org/, '/archive');
  } else if (raw.includes('pythontutor.ru')) {
    const cleanPath = raw.replace(/^https?:\/\/(www\.)?pythontutor\.ru/, '');
    fetchUrl = `/archive/web/20240301103830/http://pythontutor.ru${cleanPath}`;
  } else {
    // Treat as slug e.g. "series_1"
    const slug = raw.replace(/^\/+|\/+$/g, '');

    for (const lesson of PT_DEFAULT_LESSONS) {
      const candidateUrl = `/archive/web/20240301103830/http://pythontutor.ru/lessons/${lesson}/problems/${slug}/`;
      try {
        const res = await fetch(candidateUrl);
        if (res.ok) {
          const text = await res.text();
          if (text.includes('problem_name') || text.includes('example_tests')) {
            return { html: text, resolvedUrl: candidateUrl, slug: slug };
          }
        }
      } catch (e) {
        // continue probing
      }
    }

    fetchUrl = `/archive/web/20240301103830/http://pythontutor.ru/lessons/for_loop/problems/${slug}/`;
  }

  const response = await fetch(fetchUrl);
  if (!response.ok) {
    throw new Error(currentLang === 'en' ? `Could not find task "${inputVal}" (HTTP ${response.status}). Please check the URL or slug.` : `Не удалось найти задачу "${inputVal}" (ошибка ${response.status}). Проверьте правильность ссылки или названия задачи.`);
  }

  const html = await response.text();
  const slug = fetchUrl.replace(/\/+$/, '').split('/').pop();
  return { html, resolvedUrl: fetchUrl, slug };
}

async function fetchAndImportPythontutorTask(inputVal) {
  const { html, resolvedUrl, slug } = await fetchPythontutorHtml(inputVal);

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  // Title extraction
  const titleEl = doc.querySelector('h3.problem_name') || doc.querySelector('h3') || doc.querySelector('h2.problem_name') || doc.querySelector('h4.problem_name');
  let title = titleEl ? titleEl.textContent.trim() : (slug || 'Pythontutor Problem');
  title = title.replace(/^Задача\s*[«"»&laquo;&raquo;]*/i, '').replace(/[»"»&laquo;&raquo;]*$/, '').trim();

  const sysName = toSystemName(slug || title);

  // Legend extraction
  let legendText = '';
  const h4El = doc.querySelector('.main h4') || doc.querySelector('h4') || doc.querySelector('h3.problem_name');
  if (h4El) {
    let curr = h4El.nextSibling;
    let parts = [];
    while (curr && curr.nodeName !== 'HR' && curr.nodeName !== 'TABLE') {
      if (curr.nodeName === 'P' && curr.getAttribute && curr.getAttribute('style')?.includes('gray')) {
        break;
      }
      if (curr.outerHTML) parts.push(curr.outerHTML);
      else if (curr.textContent) parts.push(curr.textContent);
      curr = curr.nextSibling;
    }
    let rawHtml = parts.join('');
    rawHtml = rawHtml
      .replace(/&le;/g, '\\le ')
      .replace(/&ge;/g, '\\ge ')
      .replace(/&times;/g, '\\times ')
      .replace(/&ne;/g, '\\ne ')
      .replace(/<code>(.*?)<\/code>/g, '\\t{$1}');

    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = rawHtml;
    legendText = tempDiv.textContent.trim();
  }

  // Fallback legend extraction if legendText is empty
  if (!legendText) {
    const mainEl = doc.querySelector('.main') || doc.querySelector('#content') || doc.body;
    if (mainEl) {
      const clone = mainEl.cloneNode(true);
      clone.querySelectorAll('table, script, style, h3, h2, form').forEach(el => el.remove());
      legendText = clone.textContent.trim();
    }
  }

  // Example tests extraction
  const testRows = doc.querySelectorAll('#example_tests tbody tr, table.example_tests tbody tr, table.example_tests tr, #example_tests tr');
  const tests = [];
  testRows.forEach((row, idx) => {
    const inpEl = row.querySelector('pre.input') || row.querySelector('td.input pre') || row.querySelector('td:first-child pre');
    const outEl = row.querySelector('pre.output') || row.querySelector('td.output pre') || row.querySelector('td:last-child pre');
    if (inpEl && outEl) {
      const inputStr = parseHtmlEntities(inpEl.textContent);
      const outputStr = parseHtmlEntities(outEl.textContent);
      if (inputStr.trim() || outputStr.trim()) {
        tests.push({
          name: String(tests.length + 1).padStart(2, '0'),
          content: inputStr.endsWith('\n') ? inputStr : inputStr + '\n',
          answer: outputStr.endsWith('\n') ? outputStr : outputStr + '\n',
          useInStatements: tests.length < 2
        });
      }
    }
  });

  if (!legendText && tests.length === 0) {
    throw new Error(currentLang === 'en' ? 'Failed to extract problem statement or tests from the page.' : 'Не удалось извлечь условие задачи или тесты с указанной страницы.');
  }

  clearWizardData();

  multiStatements = {
    'russian': {
      name: title,
      legend: legendText,
      input: 'Входные данные содержат параметры согласно условию задачи.',
      output: 'Выведите ответ на задачу.',
      notes: '',
      tutorial: ''
    }
  };
  activeStmtLang = 'russian';
  renderStatementLangTabs();
  loadActiveFormFromState();

  const probSysNameInput = document.getElementById('prob-system-name');
  const probTimeInput = document.getElementById('prob-time-limit');
  const probMemInput = document.getElementById('prob-memory-limit');

  if (probSysNameInput) probSysNameInput.value = sysName;
  if (probTimeInput) probTimeInput.value = '2000';
  if (probMemInput) probMemInput.value = '256';

  uploadedTests = tests;

  ['prob-name', 'prob-system-name', 'prob-time-limit', 'prob-memory-limit', 'prob-legend', 'prob-input-format', 'prob-output-format'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.dispatchEvent(new Event('input'));
  });

  updateStatementPreview();
  renderTestsTable();

  closePtModal();

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

  await showCustomAlert(
    currentLang === 'en'
      ? `Successfully imported "${title}" with ${tests.length} tests!`
      : `Задача "${title}" успешно импортирована (${tests.length} тестов)!`,
    currentLang === 'en' ? 'Import Successful' : 'Импорт завершен'
  );
}

if (ptFetchBtn) {
  ptFetchBtn.addEventListener('click', async () => {
    const val = ptUrlInput ? ptUrlInput.value.trim() : '';
    if (ptStatusAlert) ptStatusAlert.style.display = 'none';

    // If user provided a ulearn link inside pt modal, route to ulearn importer
    if (val.includes('ulearn.me')) {
      closePtModal();
      openUlearnModal();
      if (ulearnUrlInput) ulearnUrlInput.value = val;
      if (ulearnFetchBtn) ulearnFetchBtn.click();
      return;
    }

    if (ptBtnSpinner) ptBtnSpinner.style.display = 'inline-block';
    ptFetchBtn.disabled = true;

    try {
      await fetchAndImportPythontutorTask(val);
    } catch (err) {
      console.error('Import error:', err);
      const errMsg = err.message || String(err);
      if (ptStatusAlert && ptStatusMsg) {
        ptStatusMsg.textContent = (currentLang === 'en' ? 'Import failed: ' : 'Ошибка импорта: ') + errMsg;
        ptStatusAlert.style.display = 'flex';
        ptStatusAlert.className = 'alert alert-error show';
        ptStatusAlert.style.backgroundColor = 'rgba(239, 68, 68, 0.15)';
        ptStatusAlert.style.color = '#ef4444';
        ptStatusAlert.style.border = '1px solid rgba(239, 68, 68, 0.3)';
        ptStatusAlert.style.marginTop = '12px';
      }
    } finally {
      if (ptBtnSpinner) ptBtnSpinner.style.display = 'none';
      ptFetchBtn.disabled = false;
    }
  });
}

// ============================================================================
// Ulearn Task Importer
// ============================================================================

const importUlearnBtn = document.getElementById('import-ulearn-btn');
const ulearnImportModal = document.getElementById('ulearn-import-modal');
const ulearnModalClose = document.getElementById('ulearn-modal-close');
const ulearnCancelBtn = document.getElementById('ulearn-cancel-btn');
const ulearnFetchBtn = document.getElementById('ulearn-fetch-btn');
const ulearnUrlInput = document.getElementById('ulearn-url-input');
const ulearnStatusAlert = document.getElementById('ulearn-status-alert');
const ulearnStatusMsg = document.getElementById('ulearn-status-msg');
const ulearnBtnSpinner = document.getElementById('ulearn-btn-spinner');

function openUlearnModal() {
  if (ulearnStatusAlert) ulearnStatusAlert.style.display = 'none';
  if (ulearnImportModal) ulearnImportModal.style.display = 'flex';
}

function closeUlearnModal() {
  if (ulearnImportModal) ulearnImportModal.style.display = 'none';
}

if (importUlearnBtn) {
  applyRippleEffect(importUlearnBtn);
  importUlearnBtn.addEventListener('click', openUlearnModal);
}
if (ulearnModalClose) ulearnModalClose.addEventListener('click', closeUlearnModal);
if (ulearnCancelBtn) ulearnCancelBtn.addEventListener('click', closeUlearnModal);
if (ulearnImportModal) {
  ulearnImportModal.addEventListener('click', (e) => {
    if (e.target === ulearnImportModal) closeUlearnModal();
  });
}

function formatUlearnHtmlToLatex(html) {
  if (!html) return '';
  const temp = document.createElement('div');
  temp.innerHTML = html;

  // Remove section titles and property titles
  temp.querySelectorAll('.section-title, .property-title').forEach(el => el.remove());

  // Replace formatting elements with LaTeX equivalents
  temp.querySelectorAll('code').forEach(el => el.replaceWith(`\\t{${el.textContent}}`));
  temp.querySelectorAll('b, strong').forEach(el => el.replaceWith(`\\textbf{${el.textContent}}`));
  temp.querySelectorAll('i, em').forEach(el => el.replaceWith(`\\textsl{${el.textContent}}`));
  temp.querySelectorAll('br').forEach(el => el.replaceWith('\n'));

  // Extract non-empty paragraphs
  const pList = Array.from(temp.querySelectorAll('p'))
    .map(p => p.textContent.trim())
    .filter(Boolean);

  let raw = '';
  if (pList.length > 0) {
    raw = pList.join('\n\n');
  } else {
    raw = temp.textContent.trim();
  }

  return raw
    .replace(/&laquo;/g, '«')
    .replace(/&raquo;/g, '»')
    .replace(/&ndash;/g, '–')
    .replace(/&mdash;/g, '—')
    .replace(/&le;/g, '\\le ')
    .replace(/&ge;/g, '\\ge ')
    .replace(/&ne;/g, '\\ne ')
    .replace(/&times;/g, '\\times ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .trim();
}

function parseUlearnUrl(input) {
  const clean = (input || '').trim();
  if (!clean) {
    throw new Error(currentLang === 'en' ? 'Please enter a ulearn.me task URL.' : 'Пожалуйста, введите ссылку на задачу с ulearn.me.');
  }

  // Extract UUID if present (standard 8-4-4-4-12 hex format)
  const uuidMatch = clean.match(/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/i);
  
  // Extract courseId
  let courseId = 'python';
  const courseMatch = clean.match(/courses?\/([a-zA-Z0-9_\-\.]+)/i);
  if (courseMatch) {
    courseId = courseMatch[1];
  } else {
    const parts = clean.replace(/^https?:\/\/[^\/]+\//, '').split('/').filter(Boolean);
    if (parts.length >= 2) {
      if (parts[0].toLowerCase() === 'course' || parts[0].toLowerCase() === 'courses') {
        courseId = parts[1];
      } else {
        courseId = parts[0];
      }
    }
  }

  // Extract slug name if present
  let slug = '';
  const lastPart = clean.replace(/\/+$/, '').split('/').pop() || '';
  const slugPartMatch = lastPart.match(/^([a-zA-Z0-9_\-]+?)(?:_[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})?$/i);
  if (slugPartMatch) {
    slug = slugPartMatch[1];
  }

  return {
    courseId,
    slideId: uuidMatch ? uuidMatch[0] : null,
    slug,
    rawInput: clean
  };
}

async function fetchUlearnJson(endpointPath) {
  const urls = [
    `/ulearn-api${endpointPath}`,
    `https://api.ulearn.me${endpointPath}`,
    `https://api.allorigins.win/raw?url=${encodeURIComponent('https://api.ulearn.me' + endpointPath)}`
  ];

  let lastError = null;
  for (const url of urls) {
    try {
      const res = await fetch(url);
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      lastError = e;
    }
  }
  throw lastError || new Error(`Failed to fetch from ulearn: ${endpointPath}`);
}

async function resolveUlearnSlideId(courseId, slugOrQuery) {
  try {
    const courseData = await fetchUlearnJson(`/courses/${courseId}`);
    const q = (slugOrQuery || '').toLowerCase().trim();
    for (const unit of courseData.units || []) {
      for (const slide of unit.slides || []) {
        if (slide.id.toLowerCase() === q ||
            (slide.slug && slide.slug.toLowerCase().includes(q)) ||
            (slide.title && slide.title.toLowerCase().includes(q))) {
          return slide.id;
        }
      }
    }
  } catch (err) {
    console.warn('Failed to resolve slide ID via course outline:', err);
  }
  return null;
}

async function fetchAndImportUlearnTask(inputVal) {
  const parsedUrl = parseUlearnUrl(inputVal);
  let slideId = parsedUrl.slideId;
  const courseId = parsedUrl.courseId;

  if (!slideId) {
    slideId = await resolveUlearnSlideId(courseId, parsedUrl.slug || parsedUrl.rawInput);
  }

  if (!slideId) {
    throw new Error(
      currentLang === 'en'
        ? `Could not identify task ID in "${inputVal}". Please provide a full link with task UUID.`
        : `Не удалось определить ID задачи по ссылке "${inputVal}". Пожалуйста, укажите полную ссылку с UUID задачи.`
    );
  }

  const slideData = await fetchUlearnJson(`/slides/${courseId}/${slideId}`);
  if (!slideData) {
    throw new Error(
      currentLang === 'en'
        ? `Failed to load slide data for ID ${slideId}.`
        : `Не удалось загрузить данные задачи с ID ${slideId}.`
    );
  }

  const title = slideData.title || parsedUrl.slug || 'Ulearn Problem';
  const sysName = toSystemName(parsedUrl.slug || title);

  let timeLimit = 1000;
  let memoryLimit = 256;
  let legendText = '';
  let inputFormat = '';
  let outputFormat = '';
  let notesText = '';
  let tutorialText = '';
  const tests = [];

  for (const block of slideData.blocks || []) {
    if (block['$type'] === 'html') {
      const content = block.content || '';
      const parser = new DOMParser();
      const doc = parser.parseFromString(content, 'text/html');

      // Title from HTML if not yet set
      const docTitle = doc.querySelector('.header .title, .problem-statement .title');
      if (docTitle && (!title || title === 'Ulearn Problem')) {
        title = docTitle.textContent.trim();
      }

      // Time limit
      const timeEl = doc.querySelector('.time-limit');
      if (timeEl) {
        timeEl.querySelectorAll('.property-title').forEach(el => el.remove());
        const rawTime = timeEl.textContent.trim();
        const secMatch = rawTime.match(/([\d\.]+)\s*(?:секунд|sec)/i);
        if (secMatch) timeLimit = Math.round(parseFloat(secMatch[1]) * 1000);
      }

      // Memory limit
      const memEl = doc.querySelector('.memory-limit');
      if (memEl) {
        memEl.querySelectorAll('.property-title').forEach(el => el.remove());
        const rawMem = memEl.textContent.trim();
        const mbMatch = rawMem.match(/(\d+)\s*(?:мегабайт|mb)/i);
        if (mbMatch) memoryLimit = parseInt(mbMatch[1], 10);
      }

      // Legend
      const legEl = doc.querySelector('.legend');
      if (legEl && !legendText) {
        legEl.querySelectorAll('.section-title').forEach(el => el.remove());
        legendText = formatUlearnHtmlToLatex(legEl.innerHTML);
      }

      // Input specification
      const inSpecEl = doc.querySelector('.input-specification');
      if (inSpecEl && !inputFormat) {
        inSpecEl.querySelectorAll('.section-title').forEach(el => el.remove());
        inputFormat = formatUlearnHtmlToLatex(inSpecEl.innerHTML);
      }

      // Output specification
      const outSpecEl = doc.querySelector('.output-specification');
      if (outSpecEl && !outputFormat) {
        outSpecEl.querySelectorAll('.section-title').forEach(el => el.remove());
        outputFormat = formatUlearnHtmlToLatex(outSpecEl.innerHTML);
      }

      // Notes
      const noteEl = doc.querySelector('.notes, .note');
      if (noteEl && !notesText) {
        noteEl.querySelectorAll('.section-title').forEach(el => el.remove());
        notesText = formatUlearnHtmlToLatex(noteEl.innerHTML);
      }

      // Sample tests
      const sampleTests = doc.querySelectorAll('.sample-test');
      if (sampleTests.length > 0) {
        sampleTests.forEach(st => {
          const inpEl = st.querySelector('.input .content') || st.querySelector('.input pre');
          const outEl = st.querySelector('.output .content') || st.querySelector('.output pre');
          if (inpEl && outEl) {
            const inputStr = parseHtmlEntities(inpEl.textContent).replace(/^\r?\n/, '');
            const outputStr = parseHtmlEntities(outEl.textContent).replace(/^\r?\n/, '');
            const formattedInput = inputStr.endsWith('\n') ? inputStr : inputStr + '\n';
            const formattedOutput = outputStr.endsWith('\n') ? outputStr : outputStr + '\n';
            const encoder = new TextEncoder();
            tests.push({
              name: String(tests.length + 1).padStart(2, '0'),
              content: formattedInput,
              answer: formattedOutput,
              size: encoder.encode(formattedInput).length,
              useInStatements: true
            });
          }
        });
      } else {
        const inputs = doc.querySelectorAll('.sample-tests .input .content, .sample-tests .input pre');
        const outputs = doc.querySelectorAll('.sample-tests .output .content, .sample-tests .output pre');
        const count = Math.min(inputs.length, outputs.length);
        for (let i = 0; i < count; i++) {
          const inputStr = parseHtmlEntities(inputs[i].textContent).replace(/^\r?\n/, '');
          const outputStr = parseHtmlEntities(outputs[i].textContent).replace(/^\r?\n/, '');
          const formattedInput = inputStr.endsWith('\n') ? inputStr : inputStr + '\n';
          const formattedOutput = outputStr.endsWith('\n') ? outputStr : outputStr + '\n';
          const encoder = new TextEncoder();
          tests.push({
            name: String(tests.length + 1).padStart(2, '0'),
            content: formattedInput,
            answer: formattedOutput,
            size: encoder.encode(formattedInput).length,
            useInStatements: true
          });
        }
      }
    } else if (block['$type'] === 'exercise') {
      if (block.renderedHints && block.renderedHints.length > 0) {
        const hintTexts = block.renderedHints.map(h => formatUlearnHtmlToLatex(h)).filter(Boolean);
        if (hintTexts.length > 0) {
          tutorialText = hintTexts.join('\n\n');
        }
      }
    }
  }

  if (!inputFormat) {
    inputFormat = tests.length > 0
      ? (currentLang === 'en' ? 'The input data contains parameters according to the problem statement.' : 'Входные данные содержат параметры согласно условию задачи.')
      : (currentLang === 'en' ? 'There is no input data.' : 'Входные данные отсутствуют.');
  }
  if (!outputFormat) {
    outputFormat = currentLang === 'en' ? 'Output the answer to the problem.' : 'Выведите ответ на задачу.';
  }

  if (!legendText && tests.length === 0) {
    throw new Error(
      currentLang === 'en'
        ? 'Could not extract statement or tests from this ulearn slide.'
        : 'Не удалось извлечь условие задачи или тесты из данного слайда ulearn.'
    );
  }

  clearWizardData();

  multiStatements = {
    'russian': {
      name: title,
      legend: legendText,
      input: inputFormat,
      output: outputFormat,
      notes: notesText,
      tutorial: tutorialText
    }
  };
  activeStmtLang = 'russian';
  renderStatementLangTabs();
  loadActiveFormFromState();

  const probSysNameInput = document.getElementById('prob-system-name');
  const probTimeInput = document.getElementById('prob-time-limit');
  const probMemInput = document.getElementById('prob-memory-limit');

  if (probSysNameInput) probSysNameInput.value = sysName;
  if (probTimeInput) probTimeInput.value = String(timeLimit);
  if (probMemInput) probMemInput.value = String(memoryLimit);

  uploadedTests = tests;

  ['prob-name', 'prob-system-name', 'prob-time-limit', 'prob-memory-limit', 'prob-legend', 'prob-input-format', 'prob-output-format', 'prob-notes', 'prob-tutorial'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.dispatchEvent(new Event('input'));
  });

  updateStatementPreview();
  renderTestsTable();

  closeUlearnModal();

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

  await showCustomAlert(
    currentLang === 'en'
      ? `Successfully imported "${title}" from Ulearn with ${tests.length} tests!`
      : `Задача "${title}" успешно импортирована с Ulearn (${tests.length} тестов)!`,
    currentLang === 'en' ? 'Ulearn Import Successful' : 'Импорт с Ulearn завершен'
  );
}

if (ulearnFetchBtn) {
  ulearnFetchBtn.addEventListener('click', async () => {
    const val = ulearnUrlInput ? ulearnUrlInput.value.trim() : '';
    if (ulearnStatusAlert) ulearnStatusAlert.style.display = 'none';
    if (ulearnBtnSpinner) ulearnBtnSpinner.style.display = 'inline-block';
    ulearnFetchBtn.disabled = true;

    try {
      await fetchAndImportUlearnTask(val);
    } catch (err) {
      console.error('Ulearn import error:', err);
      const errMsg = err.message || String(err);
      if (ulearnStatusAlert && ulearnStatusMsg) {
        ulearnStatusMsg.textContent = (currentLang === 'en' ? 'Import failed: ' : 'Ошибка импорта: ') + errMsg;
        ulearnStatusAlert.style.display = 'flex';
        ulearnStatusAlert.className = 'alert alert-error show';
        ulearnStatusAlert.style.backgroundColor = 'rgba(239, 68, 68, 0.15)';
        ulearnStatusAlert.style.color = '#ef4444';
        ulearnStatusAlert.style.border = '1px solid rgba(239, 68, 68, 0.3)';
        ulearnStatusAlert.style.marginTop = '12px';
      }
    } finally {
      if (ulearnBtnSpinner) ulearnBtnSpinner.style.display = 'none';
      ulearnFetchBtn.disabled = false;
    }
  });
}





