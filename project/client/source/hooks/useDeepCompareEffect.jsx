import { useEffect, useRef } from 'react';

function useDeepCompareEffect(callback, dependencies) {
    const prevDepsRef = useRef([]);
    const isFirstRender = useRef(true);

    // Сериализуем зависимости в строки
    const serializedDeps = dependencies.map(dep => JSON.stringify(dep));

    useEffect(() => {
        if (isFirstRender.current) {
            // Пропускаем первый вызов эффекта
            isFirstRender.current = false;
            prevDepsRef.current = serializedDeps;
            return;
        }

        // Сравниваем с предыдущими сериализованными зависимостями
        const hasChanged = serializedDeps.some(
            (dep, index) => dep !== prevDepsRef.current[index]
        );

        if (hasChanged) {
            callback();
            prevDepsRef.current = serializedDeps;
        }
    }, [callback, ...serializedDeps]);
}

export default useDeepCompareEffect;

// пример вызова
// useDeepCompareEffect(() => {
//     onChanged(); // что вызвать если изменилось состояние
// }, [Arr1, Obj1, ...);