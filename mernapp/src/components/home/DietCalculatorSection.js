import React, { useMemo, useState } from 'react';

/**
 * Mifflin-St Jeor basal metabolic rate. Chosen over Harris-Benedict because it
 * is the more accurate of the two for modern populations.
 */
const bmr = ({ sex, weightKg, heightCm, age }) => {
    const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
    return sex === 'male' ? base + 5 : base - 161;
};

const ACTIVITY_LEVELS = [
    { value: 1.2, label: 'Sedentary — desk job, little exercise' },
    { value: 1.375, label: 'Light — exercise 1-3 days a week' },
    { value: 1.55, label: 'Moderate — exercise 3-5 days a week' },
    { value: 1.725, label: 'Active — exercise 6-7 days a week' },
    { value: 1.9, label: 'Very active — physical job or twice-daily training' }
];

const GOALS = [
    { value: 'lose', label: 'Lose weight', delta: -500, protein: 0.32, fat: 0.27 },
    { value: 'maintain', label: 'Maintain', delta: 0, protein: 0.25, fat: 0.3 },
    { value: 'gain', label: 'Build muscle', delta: 350, protein: 0.3, fat: 0.27 }
];

/**
 * Works out a daily calorie and macro target, then suggests dishes from the
 * live menu that fit inside a single meal's share of it.
 */
export default function DietCalculatorSection({ foodItems }) {
    const [form, setForm] = useState({
        sex: 'male',
        age: 28,
        heightCm: 172,
        weightKg: 70,
        activity: 1.375,
        goal: 'maintain',
        mealsPerDay: 3,
        vegOnly: false
    });

    const setField = (field) => (event) => {
        const { value, type, checked } = event.target;
        setForm((previous) => ({
            ...previous,
            [field]: type === 'checkbox' ? checked : value
        }));
    };

    const result = useMemo(() => {
        const age = Number(form.age) || 0;
        const heightCm = Number(form.heightCm) || 0;
        const weightKg = Number(form.weightKg) || 0;
        const mealsPerDay = Math.max(Number(form.mealsPerDay) || 1, 1);

        if (age <= 0 || heightCm <= 0 || weightKg <= 0) {
            return null;
        }

        const goal = GOALS.find((g) => g.value === form.goal) || GOALS[1];
        const maintenance = bmr({ sex: form.sex, weightKg, heightCm, age }) * Number(form.activity);
        const target = Math.max(Math.round(maintenance + goal.delta), 1200);

        // Protein and fat are set as a share of calories, carbs take the rest.
        const proteinCals = target * goal.protein;
        const fatCals = target * goal.fat;
        const carbCals = Math.max(target - proteinCals - fatCals, 0);

        return {
            maintenance: Math.round(maintenance),
            target,
            perMeal: Math.round(target / mealsPerDay),
            macros: {
                protein: Math.round(proteinCals / 4),
                carbs: Math.round(carbCals / 4),
                fat: Math.round(fatCals / 9)
            },
            shares: {
                protein: Math.round(goal.protein * 100),
                carbs: Math.round((carbCals / target) * 100),
                fat: Math.round(goal.fat * 100)
            }
        };
    }, [form]);

    // Dishes whose full serving fits inside one meal's calorie budget, richest
    // in protein first so the suggestions are actually useful.
    const suggestions = useMemo(() => {
        if (!result) return [];

        return foodItems
            .filter((item) => item.calories > 0)
            .filter((item) => (form.vegOnly ? item.isVeg : true))
            .filter((item) => item.calories <= result.perMeal)
            .sort((a, b) => b.protein - a.protein)
            .slice(0, 6);
    }, [foodItems, result, form.vegOnly]);

    return (
        <section className="diet-calculator-section" id="diet">
            <div className="section-heading">
                <h2>Diet Calculator</h2>
                <p>
                    Work out your daily calorie and macro target, then see which dishes on our menu
                    fit inside a single meal&apos;s share of it.
                </p>
            </div>

            <div className="diet-layout">
                <form className="diet-form" onSubmit={(event) => event.preventDefault()}>
                    <div className="diet-field">
                        <label htmlFor="diet-sex">Sex</label>
                        <div className="diet-radio-row" id="diet-sex">
                            <button
                                type="button"
                                className={form.sex === 'male' ? 'active' : ''}
                                onClick={() => setForm((p) => ({ ...p, sex: 'male' }))}
                            >
                                Male
                            </button>
                            <button
                                type="button"
                                className={form.sex === 'female' ? 'active' : ''}
                                onClick={() => setForm((p) => ({ ...p, sex: 'female' }))}
                            >
                                Female
                            </button>
                        </div>
                    </div>

                    <div className="diet-field">
                        <label htmlFor="diet-age">Age (years)</label>
                        <input id="diet-age" type="number" min="10" max="100" value={form.age} onChange={setField('age')} />
                    </div>

                    <div className="diet-field">
                        <label htmlFor="diet-height">Height (cm)</label>
                        <input id="diet-height" type="number" min="100" max="240" value={form.heightCm} onChange={setField('heightCm')} />
                    </div>

                    <div className="diet-field">
                        <label htmlFor="diet-weight">Weight (kg)</label>
                        <input id="diet-weight" type="number" min="25" max="250" value={form.weightKg} onChange={setField('weightKg')} />
                    </div>

                    <div className="diet-field">
                        <label htmlFor="diet-activity">Activity level</label>
                        <select id="diet-activity" value={form.activity} onChange={setField('activity')}>
                            {ACTIVITY_LEVELS.map((level) => (
                                <option key={level.value} value={level.value}>
                                    {level.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="diet-field">
                        <label htmlFor="diet-goal">Goal</label>
                        <select id="diet-goal" value={form.goal} onChange={setField('goal')}>
                            {GOALS.map((goal) => (
                                <option key={goal.value} value={goal.value}>
                                    {goal.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="diet-field">
                        <label htmlFor="diet-meals">Meals per day</label>
                        <input id="diet-meals" type="number" min="1" max="6" value={form.mealsPerDay} onChange={setField('mealsPerDay')} />
                    </div>

                    <div className="diet-field">
                        <label htmlFor="diet-veg">
                            <input id="diet-veg" type="checkbox" checked={form.vegOnly} onChange={setField('vegOnly')} style={{ width: 'auto', marginRight: '0.5rem' }} />
                            Vegetarian suggestions only
                        </label>
                    </div>
                </form>

                <div className="diet-results">
                    {!result ? (
                        <div className="empty-state">Fill in your age, height and weight to see a target.</div>
                    ) : (
                        <>
                            <div className="diet-summary-grid">
                                <div className="diet-summary-card">
                                    <h3>{result.maintenance.toLocaleString()}</h3>
                                    <p>Maintenance kcal / day</p>
                                </div>
                                <div className="diet-summary-card">
                                    <h3>{result.target.toLocaleString()}</h3>
                                    <p>Your target kcal / day</p>
                                </div>
                                <div className="diet-summary-card">
                                    <h3>{result.perMeal.toLocaleString()}</h3>
                                    <p>Per meal budget</p>
                                </div>
                            </div>

                            <div className="diet-macros">
                                <h3>Daily macro split</h3>

                                <div className="macro-bar-row">
                                    <div className="macro-bar-label">
                                        <span>Protein</span>
                                        <strong>{result.macros.protein} g ({result.shares.protein}%)</strong>
                                    </div>
                                    <div className="macro-bar-track">
                                        <div className="macro-bar-fill protein" style={{ width: `${result.shares.protein}%` }}></div>
                                    </div>
                                </div>

                                <div className="macro-bar-row">
                                    <div className="macro-bar-label">
                                        <span>Carbohydrates</span>
                                        <strong>{result.macros.carbs} g ({result.shares.carbs}%)</strong>
                                    </div>
                                    <div className="macro-bar-track">
                                        <div className="macro-bar-fill carbs" style={{ width: `${result.shares.carbs}%` }}></div>
                                    </div>
                                </div>

                                <div className="macro-bar-row">
                                    <div className="macro-bar-label">
                                        <span>Fat</span>
                                        <strong>{result.macros.fat} g ({result.shares.fat}%)</strong>
                                    </div>
                                    <div className="macro-bar-track">
                                        <div className="macro-bar-fill fat" style={{ width: `${result.shares.fat}%` }}></div>
                                    </div>
                                </div>
                            </div>

                            <div className="diet-suggestions">
                                <h3>Dishes that fit one meal</h3>
                                {suggestions.length === 0 ? (
                                    <p className="diet-disclaimer">
                                        Nothing on the menu currently fits a {result.perMeal} kcal meal with
                                        those filters. Try more meals per day, or turn off the vegetarian filter.
                                    </p>
                                ) : (
                                    <ul className="diet-suggestion-list">
                                        {suggestions.map((item) => (
                                            <li key={item._id}>
                                                <span>
                                                    <span className="diet-suggestion-name">{item.name}</span>
                                                    <span className="diet-suggestion-meta">
                                                        {item.CategoryName}
                                                        {item.partnerName ? ` • ${item.partnerName}` : ''} •{' '}
                                                        {item.protein}g protein
                                                    </span>
                                                </span>
                                                <span className="diet-suggestion-cal">{item.calories} kcal</span>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>

                            <p className="diet-disclaimer">
                                These figures are an estimate from the Mifflin-St Jeor equation and the
                                nutrition values our partner kitchens supply. They are a guide for
                                choosing a meal, not medical advice — talk to a doctor or a registered
                                dietitian before making a significant change to your diet.
                            </p>
                        </>
                    )}
                </div>
            </div>
        </section>
    );
}
