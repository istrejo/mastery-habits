export const es = {
  common: {
    cancel: 'Cancelar',
    confirm: 'Confirmar',
    save: 'Guardar',
    back: '← Volver',
    score_suffix: '/ 100',
  },

  dashboard: {
    app_name: 'MASTERY HABITS',
    empty_title: 'Empezá tu primer hábito',
    empty_body: 'Cultivá un Commitment Score.\nLa consistencia crea maestría.',
    create_habit: '+ Crear hábito',
    score_avg: 'SCORE PROMEDIO',
    habits_today_one: '{{count}} hábito planificado para hoy',
    habits_today_other: '{{count}} hábitos planificados para hoy',
    my_habits: 'MIS HÁBITOS',
  },

  profile: {
    title: 'PERFIL',
    score_global: 'SCORE GLOBAL',
    habits_count_one: '{{count}} hábito',
    habits_count_other: '{{count}} hábitos',
    distribution: 'DISTRIBUCIÓN',
    theme_section: 'TEMA',
    language_section: 'IDIOMA',
    logout: 'Cerrar sesión',
    logout_confirm_title: 'Cerrar sesión',
    logout_confirm_body: '¿Confirmás?',
    logout_exit: 'Salir',
    logging_out: 'Cerrando sesión…',
  },

  habit_detail: {
    not_found: 'Hábito no encontrado',
    edit_title: 'Editar hábito',
    commitment_score: 'COMMITMENT SCORE',
    today_section: 'HOY',
    history_section: 'ÚLTIMOS 30 DÍAS',
    legend_completed: 'Completado',
    legend_skip: 'Skip',
    legend_missed: 'Fallado',
    frequency_section: 'FRECUENCIA',
    edit_button: 'Editar',
    archive_button: 'Archivar',
    save_changes: 'Guardar cambios',
    archive_title: 'Archivar hábito',
    archive_body: '¿Confirmás? El hábito dejará de aparecer en tu lista.',
    day_mon: 'Lun',
    day_tue: 'Mar',
    day_wed: 'Mié',
    day_thu: 'Jue',
    day_fri: 'Vie',
    day_sat: 'Sáb',
    day_sun: 'Dom',
  },

  new_habit: {
    title: 'Nuevo hábito',
    create_button: 'Crear hábito',
  },

  login: {
    app_title: 'Mastery Habits',
    tagline: 'Cultivá disciplina real.',
    email_label: 'Email',
    password_label: 'Contraseña',
    submit: 'Iniciar sesión',
    go_signup: '¿No tenés cuenta? Registrate',
    error_email: 'Email inválido',
    error_password_min: 'Mínimo 6 caracteres',
  },

  signup: {
    title: 'Crear cuenta',
    tagline: 'Empezá tu camino hacia la maestría.',
    name_label: 'Nombre',
    email_label: 'Email',
    password_label: 'Contraseña',
    confirm_password_label: 'Confirmar contraseña',
    submit: 'Crear cuenta',
    go_login: '¿Ya tenés cuenta? Iniciá sesión',
    error_name_min: 'Mínimo 2 caracteres',
    error_email: 'Email inválido',
    error_password_min: 'Mínimo 6 caracteres',
    error_passwords_match: 'Las contraseñas no coinciden',
  },

  habit_form: {
    name_label: 'Nombre',
    name_placeholder: 'Ej: Meditación',
    description_label: 'Descripción (opcional)',
    description_placeholder: '¿Para qué querés este hábito?',
    category_label: 'Categoría (opcional)',
    category_placeholder: 'Ej: Salud, Mente, Trabajo',
    error_required: 'Requerido',
    error_name_max: 'Máximo 80 caracteres',
    error_days_min: 'Seleccioná al menos un día',
    save_default: 'Guardar',
  },

  frequency: {
    label: 'Días',
    day_mon: 'L',
    day_tue: 'M',
    day_wed: 'X',
    day_thu: 'J',
    day_fri: 'V',
    day_sat: 'S',
    day_sun: 'D',
  },

  checkin: {
    not_planned: 'No es día planificado',
    skip_used: '⏭ Skip usado hoy',
    completed: '✓ Completado hoy',
    complete_action: '✓ Completar hoy',
    use_skip: '⏭ Usar skip semanal',
    skip_modal_title: 'Usar skip semanal',
    skip_modal_body: 'Tenés 1 skip por semana ISO. Conta como cumplimiento — no rompe la racha. ¿Confirmás?',
  },

  theme_picker: {
    free_tier: 'GRATIS',
    premium_tier: 'PREMIUM',
    badge_free: 'FREE',
    badge_premium: 'PREMIUM',
    coming_soon_title: 'Próximamente',
    coming_soon_body: 'Los temas premium estarán disponibles en la versión completa de Mastery Habits.',
    understood: 'Entendido',
  },

  language_picker: {
    lang_es: 'Español',
    lang_en: 'English',
  },

  levels: {
    seed: 'Seed',
    sprout: 'Sprout',
    tree: 'Tree',
    forest: 'Forest',
    ancient: 'Ancient',
  },
};

export type TranslationKeys = typeof es;
