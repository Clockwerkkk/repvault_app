import { useEffect, useMemo, useState } from "react";
import { authenticateWithInitData } from "./api/auth";
import { getExerciseProgress, listExercises } from "./api/exercises";
import { getHomeSummary } from "./api/home";
import { createSet, deleteSet, updateSet } from "./api/sets";
import {
  addExerciseToWorkout,
  createWorkout,
  finishWorkout,
  getActiveWorkout,
  getWorkoutDetails,
  getWorkoutHistory
} from "./api/workouts";
import { clearAuthState, loadAuthState, saveAuthState } from "./auth/session";
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
import { WorkoutDetailsScreen } from "./screens/WorkoutDetailsScreen";
import { WorkoutExerciseScreen } from "./screens/WorkoutExerciseScreen";
import type {
  ActiveWorkout,
  AuthState,
  ExerciseListItem,
  ExerciseProgress,
  HomeSummary,
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
  | "catalog";

export function App() {
  const { language, setLanguage, t } = useI18n();
  const allowDevTelegramAuth = import.meta.env.VITE_ALLOW_DEV_TELEGRAM_AUTH === "true";
  const [authState, setAuthState] = useState<AuthState | null>(loadAuthState());
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const [screen, setScreen] = useState<AppScreen>("home");

  const [homeSummary, setHomeSummary] = useState<HomeSummary | null>(null);
  const [homeLoading, setHomeLoading] = useState(false);

  const [activeWorkout, setActiveWorkout] = useState<ActiveWorkout | null>(null);
  const [activeWorkoutLoading, setActiveWorkoutLoading] = useState(false);

  const [pickerLoading, setPickerLoading] = useState(false);
  const [pickerSearchValue, setPickerSearchValue] = useState("");
  const [pickerGroupId, setPickerGroupId] = useState("");
  const [catalogSearchValue, setCatalogSearchValue] = useState("");
  const [exerciseItems, setExerciseItems] = useState<ExerciseListItem[]>([]);
  const [historyItems, setHistoryItems] = useState<WorkoutHistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [selectedWorkoutExerciseId, setSelectedWorkoutExerciseId] = useState<string | null>(null);
  const [weightKgInput, setWeightKgInput] = useState("");
  const [repsInput, setRepsInput] = useState("");
  const [weightInputError, setWeightInputError] = useState<string | null>(null);
  const [repsInputError, setRepsInputError] = useState<string | null>(null);
  const [setTypeInput, setSetTypeInput] = useState<"working" | "warmup">("working");
  const [editingSetId, setEditingSetId] = useState<string | null>(null);
  const [setSaving, setSetSaving] = useState(false);
  const [selectedWorkoutId, setSelectedWorkoutId] = useState<string | null>(null);
  const [workoutDetails, setWorkoutDetails] = useState<WorkoutDetails | null>(null);
  const [workoutDetailsLoading, setWorkoutDetailsLoading] = useState(false);
  const [exerciseProgress, setExerciseProgress] = useState<ExerciseProgress | null>(null);
  const [exerciseProgressLoading, setExerciseProgressLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

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

    void getActiveWorkout(authState.token)
      .then((workout) => setActiveWorkout(workout))
      .catch(() => undefined);
  }, [authState]);

  useEffect(() => {
    if (!authState || (screen !== "exercisePicker" && screen !== "catalog")) {
      return;
    }

    const search = screen === "exercisePicker" ? pickerSearchValue : catalogSearchValue;
    const category = "";
    if (screen === "exercisePicker" && !selectedPickerGroup) {
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
    catalogSearchValue,
    selectedPickerGroup,
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

    const weightKg = Number(weightKgInput);
    const reps = Number(repsInput);

    const nextWeightError = !Number.isFinite(weightKg) || weightKg <= 0 ? t("weightMustBePositive") : null;
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
    setWeightKgInput(String(setToEdit.weightKg));
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

    const weightKg = Number(weightKgInput);
    const reps = Number(repsInput);

    const nextWeightError = !Number.isFinite(weightKg) || weightKg <= 0 ? t("weightMustBePositive") : null;
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

  const signOut = (): void => {
    clearAuthState();
    setAuthState(null);
    setScreen("home");
    setHomeSummary(null);
    setActiveWorkout(null);
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
          onOpenHistory={() => void openHistory()}
          onOpenCatalog={() => setScreen("catalog")}
        />
      ) : null}

      {screen === "activeWorkout" ? (
        <ActiveWorkoutScreen
          workout={displayActiveWorkout}
          loading={activeWorkoutLoading}
          t={t}
          onBack={() => setScreen("home")}
          onAddExercise={() => setScreen("exercisePicker")}
          onSelectWorkoutExercise={openWorkoutExercise}
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

      {actionError ? <ErrorState message={actionError} /> : null}

      <div className="footer-actions">
        <button className="text-btn" onClick={signOut} type="button">
          {t("signOut")}
        </button>
      </div>
    </main>
  );
}
