# Mastery Habits: El "Credit Score" de Vida

## 1. ¿Qué es?
**Mastery Habits** es un rastreador de hábitos de alta fidelidad que sustituye las simples listas de tareas por un sistema de **puntuación de compromiso (Commitment Score)**. A diferencia de las apps convencionales, esta mide la consistencia y la calidad de la ejecución a través de niveles de maestría y algoritmos de tendencia.

## 2. ¿Por qué?
El mercado actual de apps de productividad está saturado de herramientas tipo "checklist" que se vuelven irrelevantes rápidamente. Para un usuario que busca estructura frente al desorden, una lista vacía no es suficiente. Existe una necesidad de **gamificación analítica**: convertir la disciplina en datos tangibles que motiven al usuario a no "romper la racha" no por ego, sino por mantener su nivel de maestría.

## 3. ¿Para qué? (Necesidad del usuario)
El usuario busca **eliminar la ambigüedad de su progreso personal**. La app cubre la necesidad de autogestión para perfiles que necesitan una responsabilidad psicológica externa. Al visualizar un "Score de Vida", el usuario entiende el impacto real de sus omisiones, transformando la intención en hábito mediante la visualización de datos.

## 4. Stack Tecnológico
* **Frontend:** React Native (Expo) con NativeWind.
* **Estado:** Zustand con persistencia local.
* **Backend:** Supabase (PostgreSQL) + Row Level Security (RLS).
* **Lógica de Score:** PostgreSQL Functions para cálculos en tiempo real.
