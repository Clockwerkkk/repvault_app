import { useEffect, useMemo, useState } from "react";
import { authenticateWithInitData } from "./api/auth";
import { getExerciseProgress, listExercises } from "./api/exercises";
import { getHomeSummary } from "./api/home";
import { createSet, deleteSet, updateSet } from "./api/sets";
import {
  createTemplate,
  createTemplateFromWorkout,
  deleteTemplate,
  listTemplates,
  startWorkoutFromTemplate,
  updateTemplateTitle
} from "./api/templates";
import {
  addExerciseToWorkout,
  createWorkout,
  deleteWorkout,
  deleteWorkoutExercise,
  finishWorkout,
  getActiveWorkout,
  getWorkoutDetails,
  getWorkoutHistory,
  updateWorkout
} from "./api/workouts";
import {
  loadAppSessionState,
  loadAuthState,
  saveAppSessionState,
  saveAuthState
} from "./auth/session";
import { getTelegramInitDataFromWindow } from "./auth/telegram";
import { ErrorState } from "./components/ErrorState";
import { exerciseGroups, getCatalogGroups, getItemsForGroup } from "./data/exerciseGroups";
import { localizeCategoryName, localizeExerciseName } from "./i18n/exerciseLocalization";
import { useI18n } from "./i18n/useI18n";
import { ActiveWorkoutScreen } from "./screens/ActiveWorkoutScreen";
import { CatalogScreen } from "./screens/CatalogScreen";
import { ExerciseProgressScreen } from "./screens/ExerciseProgressScreen";
import { ExercisePickerScreen } from "./screens/ExercisePickerScreen";
import { HistoryScreen } from "./screens/HistoryScreen";
import { HomeScreen } from "./screens/HomeScreen";
import { TemplateDetailsScreen } from "./screens/TemplateDetailsScreen";
import { TemplateEditorScreen } from "./screens/TemplateEditorScreen";
import { TemplatesScreen } from "./screens/TemplatesScreen";
import { WorkoutDetailsScreen } from "./screens/WorkoutDetailsScreen";
import { WorkoutExerciseScreen } from "./screens/WorkoutExerciseScreen";
import type {
  ActiveWorkout,
  AuthState,
  ExerciseListItem,
  ExerciseProgress,
  HomeSummary,
  WorkoutTemplate,
  WorkoutDetails,
  WorkoutHistoryItem
} from "./types";

type AppScreen =
  | "home"
  | "activeWorkout"
  | "exercisePicker"
  | "workoutExercise"
  | "history"
  | "workoutDetails"
  | "exerciseProgress"
  | "catalog"
  | "templates"
  | "templateDetails"
  | "templateEditor";

export function App() {
  const initialAppSession = loadAppSessionState();
  const { language, setLanguage, t } = useI18n();
  const allowDevTelegramAuth = import.meta.env.VITE_ALLOW_DEV_TELEGRAM_AUTH === "true";
  const [authState, setAuthState] = useState<AuthState | null>(loadAuthState());
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const [screen, setScreen] = useState<AppScreen>((initialAppSession?.screen as AppScreen) ?? "home");

  const [homeSummary, setHomeSummary] = useState<HomeSummary | null>(null);
  const [homeLoading, setHomeLoading] = useState(false);

  const [activeWorkout, setActiveWorkout] = useState<ActiveWorkout | null>(null);
  const [activeWorkoutLoading, setActiveWorkoutLoading] = useState(false);
  const [workoutTitleInput, setWorkoutTitleInput] = useState("");
  const [workoutTitleError, setWorkoutTitleError] = useState<string | null>(null);
  const [workoutTitleSaving, setWorkoutTitleSaving] = useState(false);

  const [pickerLoading, setPickerLoading] = useState(false);
  const [pickerSearchValue, setPickerSearchValue] = useState(initialAppSession?.pickerSearchValue ?? "");
  const [pickerGroupId, setPickerGroupId] = useState(initialAppSession?.pickerGroupId ?? "");
  const [catalogSearchValue, setCatalogSearchValue] = useState(initialAppSession?.catalogSearchValue ?? "");
  const [exerciseItems, setExerciseItems] = useState<ExerciseListItem[]>([]);
  const [historyItems, setHistoryItems] = useState<WorkoutHistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [templates, setTemplates] = useState<WorkoutTemplate[]>([]);
  const [templatesLoading, setTemplatesLoading] = useState(false);
  const [templateSaving, setTemplateSaving] = useState(false);
  const [templateEditSaving, setTemplateEditSaving] = useState(false);
  const [templateDeleting, setTemplateDeleting] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [templateEditorTitle, setTemplateEditorTitle] = useState("");
  const [templateEditorTitleError, setTemplateEditorTitleError] = useState<string | null>(null);
  const [templateEditorGroupId, setTemplateEditorGroupId] = useState("");
  const [templateEditorSearchValue, setTemplateEditorSearchValue] = useState("");
  const [templateEditorExerciseIds, setTemplateEditorExerciseIds] = useState<string[]>([]);
  const [selectedWorkoutExerciseId, setSelectedWorkoutExerciseId] = useState<string | null>(
    initialAppSession?.selectedWorkoutExerciseId ?? null
  );
  const [weightKgInput, setWeightKgInput] = useState("");
  const [repsInput, setRepsInput] = useState("");
  const [weightInputError, setWeightInputError] = useState<string | null>(null);
  const [repsInputError, setRepsInputError] = useState<string | null>(null);
  const [setTypeInput, setSetTypeInput] = useState<"working" | "warmup">("working");
  const [editingSetId, setEditingSetId] = useState<string | null>(null);
  const [setSaving, setSetSaving] = useState(false);
  const [selectedWorkoutId, setSelectedWorkoutId] = useState<string | null>(
    initialAppSession?.selectedWorkoutId ?? null
  );
  const [workoutDetails, setWorkoutDetails] = useState<WorkoutDetails | null>(null);
  const [workoutDetailsLoading, setWorkoutDetailsLoading] = useState(false);
  const [exerciseProgress, setExerciseProgress] = useState<ExerciseProgress | null>(null);
  const [exerciseProgressLoading, setExerciseProgressLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    if (!actionError) {
      return;
    }

    setActionError(null);
  }, [screen]);

  const userName = useMemo(() => authState?.user.firstName ?? "athlete", [authState]);
  const localizeExerciseItem = (item: ExerciseListItem): ExerciseListItem => ({
    ...item,
    name: localizeExerciseName(language, item.name),
    category: {
      ...item.category,
      name: localizeCategoryName(language, item.category.slug, item.category.name)
    }
  });

  const localizeActiveWorkout = (workout: ActiveWorkout): ActiveWorkout => ({
    ...workout,
    exercises: workout.exercises.map((exerciseItem) => ({
      ...exerciseItem,
      exercise: {
        ...exerciseItem.exercise,
        name: localizeExerciseName(language, exerciseItem.exercise.name),
        category: {
          ...exerciseItem.exercise.category,
          name: localizeCategoryName(
            language,
            exerciseItem.exercise.category.slug,
            exerciseItem.exercise.category.name
          )
        }
      }
    }))
  });

  const localizeWorkoutDetails = (workout: WorkoutDetails): WorkoutDetails => ({
    ...workout,
    exercises: workout.exercises.map((exerciseItem) => ({
      ...exerciseItem,
      exercise: {
        ...exerciseItem.exercise,
        name: localizeExerciseName(language, exerciseItem.exercise.name),
        category: {
          ...exerciseItem.exercise.category,
          name: localizeCategoryName(
            language,
            exerciseItem.exercise.category.slug,
            exerciseItem.exercise.category.name
          )
        }
      }
    }))
  });

  const localizeExerciseProgressData = (progress: ExerciseProgress): ExerciseProgress => ({
    ...progress,
    exercise: {
      ...progress.exercise,
      name: localizeExerciseName(language, progress.exercise.name),
      category: {
        ...progress.exercise.category,
        name: localizeCategoryName(
          language,
          progress.exercise.category.slug,
          progress.exercise.category.name
        )
      }
    }
  });
  const displayExerciseItems = useMemo(
    () =>
      exerciseItems
        .filter((item) => item.category.slug !== "full-body")
        .map(localizeExerciseItem),
    [exerciseItems, language]
  );
  const selectedPickerGroup = useMemo(
    () => exerciseGroups.find((group) => group.id === pickerGroupId) ?? null,
    [pickerGroupId]
  );
  const pickerItems = useMemo(() => {
    if (!selectedPickerGroup) {
      return [];
    }
    return getItemsForGroup(displayExerciseItems, selectedPickerGroup.id);
  }, [displayExerciseItems, selectedPickerGroup]);
  const selectedTemplateEditorGroup = useMemo(
    () => exerciseGroups.find((group) => group.id === templateEditorGroupId) ?? null,
    [templateEditorGroupId]
  );
  const templateEditorItems = useMemo(() => {
    if (!selectedTemplateEditorGroup) {
      return [];
    }
    return getItemsForGroup(displayExerciseItems, selectedTemplateEditorGroup.id).filter((item) =>
      item.name.toLowerCase().includes(templateEditorSearchValue.trim().toLowerCase())
    );
  }, [displayExerciseItems, selectedTemplateEditorGroup, templateEditorSearchValue]);
  const groupedCatalogItems = useMemo(
    () => getCatalogGroups(displayExerciseItems),
    [displayExerciseItems]
  );
  const displayActiveWorkout = useMemo(
    () => (activeWorkout ? localizeActiveWorkout(activeWorkout) : null),
    [activeWorkout, language]
  );
  const addedExerciseIds = useMemo(
    () => (displayActiveWorkout ? displayActiveWorkout.exercises.map((item) => item.exercise.id) : []),
    [displayActiveWorkout]
  );
  const displayWorkoutDetails = useMemo(
    () => (workoutDetails ? localizeWorkoutDetails(workoutDetails) : null),
    [workoutDetails, language]
  );
  const displayExerciseProgress = useMemo(
    () => (exerciseProgress ? localizeExerciseProgressData(exerciseProgress) : null),
    [exerciseProgress, language]
  );
  const displayTemplates = useMemo(
    () =>
      templates.map((template) => ({
        ...template,
        exercises: template.exercises.map((item) => ({
          ...item,
          exercise: {
            ...item.exercise,
            name: localizeExerciseName(language, item.exercise.name),
            category: {
              ...item.exercise.category,
              name: localizeCategoryName(
                language,
                item.exercise.category.slug,
                item.exercise.category.name
              )
            }
          }
        }))
      })),
    [templates, language]
  );
  const templateEditorSelectedItems = useMemo(
    () =>
      templateEditorExerciseIds
        .map((exerciseId) => displayExerciseItems.find((item) => item.id === exerciseId) ?? null)
        .filter((item): item is ExerciseListItem => item !== null),
    [templateEditorExerciseIds, displayExerciseItems]
  );

  useEffect(() => {
    if (!authState) {
      return;
    }

    setHomeLoading(true);
    getHomeSummary(authState.token)
      .then(setHomeSummary)
      .catch((error: unknown) => {
        const message = error instanceof Error ? error.message : t("failedToLoadHome");
        setActionError(message);
      })
      .finally(() => setHomeLoading(false));
  }, [authState]);

  useEffect(() => {
    if (!authState) {
      return;
    }

    setTemplatesLoading(true);
    listTemplates(authState.token)
      .then((result) => setTemplates(result.items))
      .catch(() => undefined)
      .finally(() => setTemplatesLoading(false));
  }, [authState]);

  useEffect(() => {
    if (!authState) {
      return;
    }

    saveAppSessionState({
      screen,
      selectedWorkoutExerciseId,
      selectedWorkoutId,
      pickerSearchValue,
      pickerGroupId,
      catalogSearchValue
    });
  }, [
    authState,
    screen,
    selectedWorkoutExerciseId,
    selectedWorkoutId,
    pickerSearchValue,
    pickerGroupId,
    catalogSearchValue
  ]);

  useEffect(() => {
    if (!displayActiveWorkout) {
      setWorkoutTitleInput("");
      setWorkoutTitleError(null);
      return;
    }

    setWorkoutTitleInput(displayActiveWorkout.title);
  }, [displayActiveWorkout]);

  useEffect(() => {
    if (!authState) {
      return;
    }

    void getActiveWorkout(authState.token)
      .then((workout) => setActiveWorkout(workout))
      .catch(() => undefined);
  }, [authState]);

  useEffect(() => {
    if (!authState) {
      return;
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState !== "visible") {
        return;
      }

      void getActiveWorkout(authState.token)
        .then((workout) => {
          setActiveWorkout(workout);
          if (!workout && (screen === "activeWorkout" || screen === "exercisePicker" || screen === "workoutExercise")) {
            setScreen("home");
          }
        })
        .catch(() => undefined);

      void getHomeSummary(authState.token)
        .then(setHomeSummary)
        .catch(() => undefined);
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [authState, screen]);

  useEffect(() => {
    if (activeWorkout || (screen !== "activeWorkout" && screen !== "exercisePicker" && screen !== "workoutExercise")) {
      return;
    }

    setScreen("home");
  }, [activeWorkout, screen]);

  useEffect(() => {
    if (!authState || (screen !== "exercisePicker" && screen !== "catalog" && screen !== "templateEditor")) {
      return;
    }

    const search =
      screen === "exercisePicker"
        ? pickerSearchValue
        : screen === "templateEditor"
          ? templateEditorSearchValue
          : catalogSearchValue;
    const category = "";
    if (screen === "exercisePicker" && !selectedPickerGroup) {
      setExerciseItems([]);
      setPickerLoading(false);
      return;
    }
    if (screen === "templateEditor" && !selectedTemplateEditorGroup) {
      setExerciseItems([]);
      setPickerLoading(false);
      return;
    }

    setPickerLoading(true);
    listExercises(authState.token, {
      search: search || undefined,
      category: category || undefined,
      limit: 300
    })
      .then((result) => setExerciseItems(result.items))
      .catch((error: unknown) => {
        const message = error instanceof Error ? error.message : t("failedToLoadExercises");
        setActionError(message);
      })
      .finally(() => setPickerLoading(false));
  }, [
    authState,
    screen,
    pickerSearchValue,
    pickerGroupId,
    templateEditorSearchValue,
    templateEditorGroupId,
    catalogSearchValue,
    selectedPickerGroup,
    selectedTemplateEditorGroup,
    t
  ]);

  const authenticate = async (): Promise<void> => {
    const initDataFromTelegram = getTelegramInitDataFromWindow();
    const trimmedInitData = initDataFromTelegram.trim();
    if (!trimmedInitData && !allowDevTelegramAuth) {
      setAuthError(t("authOpenFromTelegramHint"));
      return;
    }
    const initData = trimmedInitData || "dev-fallback-init-data";

    try {
      setAuthLoading(true);
      const nextAuthState = await authenticateWithInitData(initData);
      saveAuthState(nextAuthState);
      setAuthState(nextAuthState);
      setAuthError(null);
      setActionError(null);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Auth failed";
      setAuthError(
        `${t("authFailedHint")}\n${message}`
      );
    } finally {
      setAuthLoading(false);
    }
  };

  useEffect(() => {
    if (authState) {
      return;
    }
    void authenticate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authState]);

  const openActiveWorkout = async (): Promise<void> => {
    if (!authState) {
      return;
    }

    if (activeWorkout) {
      setScreen("activeWorkout");
      return;
    }

    setActionError(null);
    setActiveWorkoutLoading(true);
    try {
      await createWorkout(authState.token);
      const workout = await getActiveWorkout(authState.token);
      setActiveWorkout(workout);
      setScreen("activeWorkout");
    } catch (error: unknown) {
      const fallbackMessage = error instanceof Error ? error.message : t("failedToStartWorkout");
      setActionError(fallbackMessage);
    } finally {
      setActiveWorkoutLoading(false);
    }
  };

  const refreshActiveWorkout = async (): Promise<void> => {
    if (!authState) {
      return;
    }

    setActiveWorkoutLoading(true);
    try {
      const workout = await getActiveWorkout(authState.token);
      setActiveWorkout(workout);
    } catch (error: unknown) {
      const fallbackMessage = error instanceof Error ? error.message : t("failedToLoadWorkout");
      setActionError(fallbackMessage);
    } finally {
      setActiveWorkoutLoading(false);
    }
  };

  const saveWorkoutTitle = async (): Promise<void> => {
    if (!authState || !activeWorkout) {
      return;
    }

    const normalizedTitle = workoutTitleInput.trim();
    if (!normalizedTitle) {
      setWorkoutTitleError(t("workoutTitleRequired"));
      return;
    }

    setWorkoutTitleSaving(true);
    setWorkoutTitleError(null);
    try {
      await updateWorkout(authState.token, activeWorkout.id, { title: normalizedTitle });
      await refreshActiveWorkout();
      const summary = await getHomeSummary(authState.token);
      setHomeSummary(summary);
    } catch (error: unknown) {
      const fallbackMessage = error instanceof Error ? error.message : t("failedToUpdateWorkout");
      setActionError(fallbackMessage);
    } finally {
      setWorkoutTitleSaving(false);
    }
  };

  const removeWorkoutExercise = async (workoutExerciseId: string): Promise<void> => {
    if (!authState || !activeWorkout) {
      return;
    }

    if (!confirmAction(t("confirmDeleteExercise"))) {
      return;
    }

    try {
      await deleteWorkoutExercise(authState.token, activeWorkout.id, workoutExerciseId);
      if (selectedWorkoutExerciseId === workoutExerciseId) {
        setSelectedWorkoutExerciseId(null);
        setScreen("activeWorkout");
      }
      await refreshActiveWorkout();
    } catch (error: unknown) {
      const fallbackMessage = error instanceof Error ? error.message : t("failedToDeleteExercise");
      setActionError(fallbackMessage);
    }
  };

  const removeWorkout = async (workoutId: string): Promise<void> => {
    if (!authState) {
      return;
    }

    if (!confirmAction(t("confirmDeleteWorkout"))) {
      return;
    }

    try {
      await deleteWorkout(authState.token, workoutId);
      setSelectedWorkoutId(null);
      setWorkoutDetails(null);
      if (activeWorkout?.id === workoutId) {
        setActiveWorkout(null);
        setSelectedWorkoutExerciseId(null);
      }
      const [summary, history, workout] = await Promise.all([
        getHomeSummary(authState.token),
        getWorkoutHistory(authState.token),
        getActiveWorkout(authState.token)
      ]);
      setHomeSummary(summary);
      setHistoryItems(history.items);
      setActiveWorkout(workout);
      setScreen("home");
    } catch (error: unknown) {
      const fallbackMessage = error instanceof Error ? error.message : t("failedToDeleteWorkout");
      setActionError(fallbackMessage);
    }
  };

  const saveActiveWorkoutAsTemplate = async (): Promise<void> => {
    if (!authState || !activeWorkout) {
      return;
    }

    const nextTemplateTitle = window.prompt(t("templateNamePrompt"), activeWorkout.title) ?? "";
    const normalizedTemplateTitle = nextTemplateTitle.trim();
    if (!normalizedTemplateTitle) {
      return;
    }

    try {
      setTemplateSaving(true);
      await createTemplateFromWorkout(authState.token, activeWorkout.id, normalizedTemplateTitle);
      const result = await listTemplates(authState.token);
      setTemplates(result.items);
    } catch (error: unknown) {
      const fallbackMessage = error instanceof Error ? error.message : t("failedToCreateTemplate");
      setActionError(fallbackMessage);
    } finally {
      setTemplateSaving(false);
    }
  };

  const quickStartFromTemplate = async (templateId: string): Promise<void> => {
    if (!authState) {
      return;
    }

    try {
      await startWorkoutFromTemplate(authState.token, templateId);
      const workout = await getActiveWorkout(authState.token);
      setActiveWorkout(workout);
      setScreen("activeWorkout");
    } catch (error: unknown) {
      const fallbackMessage = error instanceof Error ? error.message : t("failedToStartFromTemplate");
      setActionError(fallbackMessage);
    }
  };

  const confirmAction = (message: string): boolean => {
    return window.confirm(message);
  };

  const addExercise = async (exerciseId: string): Promise<void> => {
    if (!authState || !activeWorkout) {
      return;
    }

    try {
      const result = await addExerciseToWorkout(authState.token, activeWorkout.id, exerciseId);
      const maybeWorkoutExerciseId =
        (result as { workoutExerciseId?: string; id?: string }).workoutExerciseId ??
        (result as { workoutExerciseId?: string; id?: string }).id;
      setPickerSearchValue("");
      const workout = await getActiveWorkout(authState.token);
      if (workout) {
        setActiveWorkout(workout);
      }

      const targetWorkoutExerciseId =
        maybeWorkoutExerciseId ??
        workout?.exercises.find((item) => item.exercise.id === exerciseId)?.id ??
        null;

      if (targetWorkoutExerciseId) {
        setSelectedWorkoutExerciseId(targetWorkoutExerciseId);
        setScreen("workoutExercise");
        return;
      }

      setScreen("activeWorkout");
    } catch (error: unknown) {
      const fallbackMessage = error instanceof Error ? error.message : t("failedToAddExercise");
      setActionError(fallbackMessage);
    }
  };

  const finishActiveWorkout = async (): Promise<void> => {
    if (!authState || !activeWorkout) {
      return;
    }

    try {
      await finishWorkout(authState.token, activeWorkout.id);
      await refreshActiveWorkout();
      const summary = await getHomeSummary(authState.token);
      setHomeSummary(summary);
      setScreen("home");
    } catch (error: unknown) {
      const fallbackMessage = error instanceof Error ? error.message : t("failedToFinishWorkout");
      setActionError(fallbackMessage);
    }
  };

  const openWorkoutExercise = (workoutExerciseId: string): void => {
    setSelectedWorkoutExerciseId(workoutExerciseId);
    setScreen("workoutExercise");
  };

  const selectedWorkoutExercise =
    displayActiveWorkout?.exercises.find((item) => item.id === selectedWorkoutExerciseId) ?? null;

  const addSetToExercise = async (): Promise<void> => {
    if (!authState || !selectedWorkoutExercise) {
      return;
    }

    const normalizedWeightInput = weightKgInput.trim();
    const weightKg = normalizedWeightInput ? Number(normalizedWeightInput) : null;
    const reps = Number(repsInput);

    const nextWeightError =
      weightKg !== null && (!Number.isFinite(weightKg) || weightKg < 0) ? t("weightMustBePositiveOrEmpty") : null;
    const nextRepsError = !Number.isFinite(reps) || reps <= 0 ? t("repsMustBePositive") : null;
    setWeightInputError(nextWeightError);
    setRepsInputError(nextRepsError);

    if (nextWeightError || nextRepsError) {
      return;
    }

    try {
      setSetSaving(true);
      await createSet(authState.token, selectedWorkoutExercise.id, {
        weightKg,
        reps,
        setType: setTypeInput
      });
      setWeightKgInput("");
      setRepsInput("");
      setWeightInputError(null);
      setRepsInputError(null);
      await refreshActiveWorkout();
    } catch (error: unknown) {
      const fallbackMessage = error instanceof Error ? error.message : t("failedToCreateSet");
      setActionError(fallbackMessage);
    } finally {
      setSetSaving(false);
    }
  };

  const startEditSet = (setId: string): void => {
    if (!selectedWorkoutExercise) {
      return;
    }

    const setToEdit = selectedWorkoutExercise.sets.find((set) => set.id === setId);
    if (!setToEdit) {
      return;
    }

    setEditingSetId(setToEdit.id);
    setWeightKgInput(setToEdit.weightKg === null ? "" : String(setToEdit.weightKg));
    setRepsInput(String(setToEdit.reps));
    setSetTypeInput(setToEdit.setType);
  };

  const cancelEditSet = (): void => {
    setEditingSetId(null);
    setWeightKgInput("");
    setRepsInput("");
    setWeightInputError(null);
    setRepsInputError(null);
    setSetTypeInput("working");
  };

  const saveEditedSet = async (): Promise<void> => {
    if (!authState || !editingSetId) {
      return;
    }

    const normalizedWeightInput = weightKgInput.trim();
    const weightKg = normalizedWeightInput ? Number(normalizedWeightInput) : null;
    const reps = Number(repsInput);

    const nextWeightError =
      weightKg !== null && (!Number.isFinite(weightKg) || weightKg < 0) ? t("weightMustBePositiveOrEmpty") : null;
    const nextRepsError = !Number.isFinite(reps) || reps <= 0 ? t("repsMustBePositive") : null;
    setWeightInputError(nextWeightError);
    setRepsInputError(nextRepsError);

    if (nextWeightError || nextRepsError) {
      return;
    }

    try {
      setSetSaving(true);
      await updateSet(authState.token, editingSetId, {
        weightKg,
        reps,
        setType: setTypeInput
      });
      cancelEditSet();
      await refreshActiveWorkout();
    } catch (error: unknown) {
      const fallbackMessage = error instanceof Error ? error.message : t("failedToUpdateSet");
      setActionError(fallbackMessage);
    } finally {
      setSetSaving(false);
    }
  };

  const removeSetFromExercise = async (setId: string): Promise<void> => {
    if (!authState) {
      return;
    }

    if (!confirmAction(t("confirmDeleteSet"))) {
      return;
    }

    try {
      await deleteSet(authState.token, setId);
      await refreshActiveWorkout();
    } catch (error: unknown) {
      const fallbackMessage = error instanceof Error ? error.message : t("failedToDeleteSet");
      setActionError(fallbackMessage);
    }
  };

  const openHistory = async (): Promise<void> => {
    if (!authState) {
      return;
    }

    setHistoryLoading(true);
    setScreen("history");
    try {
      const result = await getWorkoutHistory(authState.token);
      setHistoryItems(result.items);
    } catch (error: unknown) {
      const fallbackMessage = error instanceof Error ? error.message : t("failedToLoadHistory");
      setActionError(fallbackMessage);
    } finally {
      setHistoryLoading(false);
    }
  };

  const openTemplates = async (): Promise<void> => {
    if (!authState) {
      return;
    }

    setTemplatesLoading(true);
    setScreen("templates");
    try {
      const result = await listTemplates(authState.token);
      setTemplates(result.items);
    } catch (error: unknown) {
      const fallbackMessage = error instanceof Error ? error.message : t("failedToLoadTemplates");
      setActionError(fallbackMessage);
    } finally {
      setTemplatesLoading(false);
    }
  };

  const openTemplateDetails = (templateId: string): void => {
    setSelectedTemplateId(templateId);
    setScreen("templateDetails");
  };

  const openCreateTemplateEditor = (): void => {
    setSelectedTemplateId(null);
    setTemplateEditorTitle("");
    setTemplateEditorTitleError(null);
    setTemplateEditorGroupId("");
    setTemplateEditorSearchValue("");
    setTemplateEditorExerciseIds([]);
    setScreen("templateEditor");
  };

  const editTemplate = async (templateId: string): Promise<void> => {
    const current = templates.find((item) => item.id === templateId);
    if (!current) {
      return;
    }
    setSelectedTemplateId(current.id);
    setTemplateEditorTitle(current.title);
    setTemplateEditorTitleError(null);
    setTemplateEditorGroupId("");
    setTemplateEditorSearchValue("");
    setTemplateEditorExerciseIds(current.exercises.map((item) => item.exercise.id));
    setScreen("templateEditor");
  };

  const removeTemplate = async (templateId: string): Promise<void> => {
    if (!authState) {
      return;
    }

    if (!confirmAction(t("confirmDeleteTemplate"))) {
      return;
    }

    setTemplateDeleting(true);
    try {
      await deleteTemplate(authState.token, templateId);
      const result = await listTemplates(authState.token);
      setTemplates(result.items);
      setSelectedTemplateId(null);
      setScreen("templates");
    } catch (error: unknown) {
      const fallbackMessage = error instanceof Error ? error.message : t("failedToDeleteTemplate");
      setActionError(fallbackMessage);
    } finally {
      setTemplateDeleting(false);
    }
  };

  const addExerciseToTemplateEditor = (exerciseId: string): void => {
    setTemplateEditorExerciseIds((prev) => (prev.includes(exerciseId) ? prev : [...prev, exerciseId]));
  };

  const removeExerciseFromTemplateEditor = (exerciseId: string): void => {
    setTemplateEditorExerciseIds((prev) => prev.filter((id) => id !== exerciseId));
  };

  const saveTemplateEditor = async (): Promise<void> => {
    if (!authState) {
      return;
    }

    const normalizedTitle = templateEditorTitle.trim();
    if (!normalizedTitle) {
      setTemplateEditorTitleError(t("templateTitleRequired"));
      return;
    }
    if (templateEditorExerciseIds.length === 0) {
      setTemplateEditorTitleError(t("templateExercisesRequired"));
      return;
    }

    setTemplateEditSaving(true);
    setTemplateEditorTitleError(null);
    try {
      const result = selectedTemplateId
        ? await updateTemplateTitle(authState.token, selectedTemplateId, {
            title: normalizedTitle,
            exerciseIds: templateEditorExerciseIds
          })
        : await createTemplate(authState.token, {
            title: normalizedTitle,
            exerciseIds: templateEditorExerciseIds
          });

      const templatesResult = await listTemplates(authState.token);
      setTemplates(templatesResult.items);
      setSelectedTemplateId(result.id);
      setScreen("templateDetails");
    } catch (error: unknown) {
      const fallbackMessage = error instanceof Error ? error.message : t("failedToUpdateTemplate");
      setActionError(fallbackMessage);
    } finally {
      setTemplateEditSaving(false);
    }
  };

  const openWorkoutDetails = async (workoutId: string): Promise<void> => {
    if (!authState) {
      return;
    }

    setSelectedWorkoutId(workoutId);
    setWorkoutDetailsLoading(true);
    setScreen("workoutDetails");
    try {
      const result = await getWorkoutDetails(authState.token, workoutId);
      setWorkoutDetails(result);
    } catch (error: unknown) {
      const fallbackMessage =
        error instanceof Error ? error.message : t("failedToLoadWorkoutDetails");
      setActionError(fallbackMessage);
    } finally {
      setWorkoutDetailsLoading(false);
    }
  };

  const openExerciseProgress = async (exerciseId: string): Promise<void> => {
    if (!authState) {
      return;
    }

    setExerciseProgressLoading(true);
    setScreen("exerciseProgress");
    try {
      const result = await getExerciseProgress(authState.token, exerciseId);
      setExerciseProgress(result);
    } catch (error: unknown) {
      const fallbackMessage =
        error instanceof Error ? error.message : t("failedToLoadExerciseProgress");
      setActionError(fallbackMessage);
    } finally {
      setExerciseProgressLoading(false);
    }
  };

  if (!authState) {
    return (
      <main className="container">
        <section className="screen">
          <h1>GymLog Mini</h1>
          <p>{t("authInProgress")}</p>
          <button className="primary-btn" onClick={() => void authenticate()} type="button">
            {authLoading ? t("signingIn") : t("signIn")}
          </button>
          {authError ? <ErrorState message={authError} /> : null}
        </section>
      </main>
    );
  }

  return (
    <main className="container">
      {screen === "home" ? (
        <HomeScreen
          userName={userName}
          summary={homeSummary}
          loading={homeLoading}
          hasActiveWorkout={Boolean(activeWorkout)}
          language={language}
          t={t}
          onLanguageChange={setLanguage}
          onStartWorkout={() => void openActiveWorkout()}
          onOpenTemplates={() => void openTemplates()}
          onOpenHistory={() => void openHistory()}
          onOpenCatalog={() => setScreen("catalog")}
        />
      ) : null}

      {screen === "activeWorkout" ? (
        <ActiveWorkoutScreen
          workout={displayActiveWorkout}
          loading={activeWorkoutLoading}
          titleDraft={workoutTitleInput}
          titleError={workoutTitleError}
          titleSaving={workoutTitleSaving}
          templateSaving={templateSaving}
          t={t}
          onBack={() => setScreen("home")}
          onTitleDraftChange={(value) => {
            setWorkoutTitleInput(value);
            if (workoutTitleError) {
              setWorkoutTitleError(null);
            }
          }}
          onSaveTitle={() => void saveWorkoutTitle()}
          onDeleteWorkout={() => {
            if (!displayActiveWorkout) {
              return;
            }
            void removeWorkout(displayActiveWorkout.id);
          }}
          onSaveTemplate={() => void saveActiveWorkoutAsTemplate()}
          onAddExercise={() => setScreen("exercisePicker")}
          onSelectWorkoutExercise={openWorkoutExercise}
          onDeleteWorkoutExercise={(workoutExerciseId) => void removeWorkoutExercise(workoutExerciseId)}
          onFinishWorkout={() => void finishActiveWorkout()}
        />
      ) : null}

      {screen === "exercisePicker" ? (
        <ExercisePickerScreen
          items={pickerItems}
          searchValue={pickerSearchValue}
          selectedGroupId={pickerGroupId}
          groups={exerciseGroups}
          addedExerciseIds={addedExerciseIds}
          loading={pickerLoading}
          t={t}
          onBack={() => setScreen("activeWorkout")}
          onSearchChange={setPickerSearchValue}
          onGroupChange={setPickerGroupId}
          onSelectExercise={(exerciseId) => void addExercise(exerciseId)}
        />
      ) : null}

      {screen === "history" ? (
        <HistoryScreen
          items={historyItems}
          loading={historyLoading}
          t={t}
          onBack={() => setScreen("home")}
          onOpenWorkout={(workoutId) => void openWorkoutDetails(workoutId)}
        />
      ) : null}

      {screen === "workoutExercise" ? (
        <WorkoutExerciseScreen
          workoutExercise={selectedWorkoutExercise}
          weightKg={weightKgInput}
          reps={repsInput}
          setType={setTypeInput}
          editingSetId={editingSetId}
          saving={setSaving}
          weightError={weightInputError}
          repsError={repsInputError}
          t={t}
          onBack={() => setScreen("activeWorkout")}
          onWeightChange={(value) => {
            setWeightKgInput(value);
            if (weightInputError) {
              setWeightInputError(null);
            }
          }}
          onRepsChange={(value) => {
            setRepsInput(value);
            if (repsInputError) {
              setRepsInputError(null);
            }
          }}
          onSetTypeChange={setSetTypeInput}
          onAddSet={() => void addSetToExercise()}
          onStartEditSet={startEditSet}
          onCancelEditSet={cancelEditSet}
          onSaveEditSet={() => void saveEditedSet()}
          onDeleteSet={(setId) => void removeSetFromExercise(setId)}
        />
      ) : null}

      {screen === "workoutDetails" ? (
        <WorkoutDetailsScreen
          workout={displayWorkoutDetails}
          loading={workoutDetailsLoading}
          t={t}
          onBack={() => setScreen("history")}
          onDeleteWorkout={(workoutId) => void removeWorkout(workoutId)}
          onOpenExerciseProgress={(exerciseId) => void openExerciseProgress(exerciseId)}
        />
      ) : null}

      {screen === "exerciseProgress" ? (
        <ExerciseProgressScreen
          progress={displayExerciseProgress}
          loading={exerciseProgressLoading}
          t={t}
          onBack={() => setScreen(selectedWorkoutId ? "workoutDetails" : "history")}
        />
      ) : null}

      {screen === "catalog" ? (
        <CatalogScreen
          groupedItems={groupedCatalogItems}
          loading={pickerLoading}
          searchValue={catalogSearchValue}
          t={t}
          onBack={() => setScreen("home")}
          onSearchChange={setCatalogSearchValue}
          onOpenProgress={(exerciseId) => void openExerciseProgress(exerciseId)}
        />
      ) : null}

      {screen === "templates" ? (
        <TemplatesScreen
          items={displayTemplates}
          loading={templatesLoading}
          t={t}
          onBack={() => setScreen("home")}
          onCreateTemplate={openCreateTemplateEditor}
          onOpenTemplate={openTemplateDetails}
          onStartFromTemplate={(templateId) => void quickStartFromTemplate(templateId)}
        />
      ) : null}

      {screen === "templateDetails" ? (
        <TemplateDetailsScreen
          template={displayTemplates.find((item) => item.id === selectedTemplateId) ?? null}
          t={t}
          editing={templateEditSaving}
          deleting={templateDeleting}
          onBack={() => setScreen("templates")}
          onEditTemplate={(templateId) => void editTemplate(templateId)}
          onDeleteTemplate={(templateId) => void removeTemplate(templateId)}
          onStartFromTemplate={(templateId) => void quickStartFromTemplate(templateId)}
        />
      ) : null}

      {screen === "templateEditor" ? (
        <TemplateEditorScreen
          title={templateEditorTitle}
          titleError={templateEditorTitleError}
          selectedGroupId={templateEditorGroupId}
          searchValue={templateEditorSearchValue}
          groups={exerciseGroups}
          availableItems={templateEditorItems}
          selectedItems={templateEditorSelectedItems}
          loading={pickerLoading}
          saving={templateEditSaving}
          t={t}
          onBack={() => setScreen(selectedTemplateId ? "templateDetails" : "templates")}
          onTitleChange={(value) => {
            setTemplateEditorTitle(value);
            if (templateEditorTitleError) {
              setTemplateEditorTitleError(null);
            }
          }}
          onGroupChange={setTemplateEditorGroupId}
          onSearchChange={setTemplateEditorSearchValue}
          onAddExercise={addExerciseToTemplateEditor}
          onRemoveExercise={removeExerciseFromTemplateEditor}
          onSave={() => void saveTemplateEditor()}
        />
      ) : null}

      {actionError ? <ErrorState message={actionError} /> : null}
    </main>
  );
}
