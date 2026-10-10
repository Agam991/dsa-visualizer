// Every algorithm returns the same kind of visual step for the renderer.
function snapshot(array, condition, options = {}) {
    return {
        array: [...array],
        condition,
        code: options.code || "",
        pointers: options.pointers || [],
        compare: options.compare || [],
        sorted: options.sorted || [],
        found: options.found || [],
        range: options.range || [],
        mergeView: options.mergeView || null
    };
}

const pointer = (index, label) => ({ index, label });
const prefix = count => Array.from({ length: count }, (_, i) => i);
const suffix = (length, count) => Array.from({ length: count }, (_, i) => length - count + i);

export function bubbleSort(input) {
    const a = [...input], steps = [], n = a.length;
    steps.push(snapshot(a, "Ready to compare adjacent elements.", { code: "for (i = 0; i < n - 1; i++)" }));
    for (let i = 0; i < n - 1; i++) {
        let swapped = false;
        for (let j = 0; j < n - i - 1; j++) {
            const pointers = [pointer(j, "j"), pointer(j + 1, "j + 1")];
            steps.push(snapshot(a, `Compare ${a[j]} and ${a[j + 1]}.`, { code: "if (array[j] > array[j + 1])", pointers, compare: [j, j + 1], sorted: suffix(n, i) }));
            if (a[j] > a[j + 1]) {
                [a[j], a[j + 1]] = [a[j + 1], a[j]];
                swapped = true;
                steps.push(snapshot(a, `Swap: ${a[j]} and ${a[j + 1]} are now in order.`, { code: "swap(array[j], array[j + 1])", pointers, compare: [j, j + 1], sorted: suffix(n, i) }));
            } else {
                steps.push(snapshot(a, "No swap needed.", { code: "condition is false; continue", pointers, compare: [j, j + 1], sorted: suffix(n, i) }));
            }
        }
        steps.push(snapshot(a, `Pass ${i + 1} complete.`, { code: "largest remaining value is in its final position", sorted: suffix(n, i + 1) }));
        if (!swapped) break;
    }
    steps.push(snapshot(a, "Array sorted ✓", { code: "Bubble Sort complete", sorted: prefix(n) }));
    return steps;
}

export function selectionSort(input) {
    const a = [...input], steps = [], n = a.length;
    for (let i = 0; i < n - 1; i++) {
        let min = i;
        steps.push(snapshot(a, `Start pass ${i + 1}; assume ${a[min]} is the minimum.`, { code: "min = i", pointers: [pointer(i, "i"), pointer(min, "min")], sorted: prefix(i) }));
        for (let j = i + 1; j < n; j++) {
            const p = [pointer(i, "i"), pointer(j, "j"), pointer(min, "min")];
            steps.push(snapshot(a, `Compare ${a[j]} with current minimum ${a[min]}.`, { code: "if (array[j] < array[min])", pointers: p, compare: [j, min], sorted: prefix(i) }));
            if (a[j] < a[min]) {
                min = j;
                steps.push(snapshot(a, `New minimum: ${a[min]}.`, { code: "min = j", pointers: [pointer(i, "i"), pointer(j, "j"), pointer(min, "min")], compare: [min], sorted: prefix(i) }));
            }
        }
        if (min !== i) {
            [a[i], a[min]] = [a[min], a[i]];
            steps.push(snapshot(a, `Place minimum ${a[i]} at index ${i}.`, { code: "swap(array[i], array[min])", pointers: [pointer(i, "i"), pointer(min, "min")], compare: [i, min], sorted: prefix(i) }));
        } else {
            steps.push(snapshot(a, `${a[i]} is already the minimum for this pass.`, { code: "no swap needed", pointers: [pointer(i, "i")], sorted: prefix(i) }));
        }
        steps.push(snapshot(a, `Index ${i} is now sorted.`, { code: "move to the next position", sorted: prefix(i + 1) }));
    }
    steps.push(snapshot(a, "Array sorted ✓", { code: "Selection Sort complete", sorted: prefix(n) }));
    return steps;
}

export function insertionSort(input) {
    const a = [...input], steps = [], n = a.length;
    steps.push(snapshot(a, "The first element is considered sorted.", { code: "for (i = 1; i < n; i++)", sorted: prefix(1) }));
    for (let i = 1; i < n; i++) {
        const key = a[i];
        let j = i - 1;
        steps.push(snapshot(a, `Store ${key} as the key to insert.`, { code: "key = array[i]", pointers: [pointer(i, "i"), pointer(i, "key")], compare: [i], sorted: prefix(i) }));
        while (j >= 0 && a[j] > key) {
            steps.push(snapshot(a, `Move ${a[j]} one position right.`, { code: "while (j >= 0 && array[j] > key)", pointers: [pointer(j, "j"), pointer(i, "key")], compare: [j, i], sorted: prefix(i) }));
            a[j + 1] = a[j];
            steps.push(snapshot(a, `Shift ${a[j + 1]} to index ${j + 1}.`, { code: "array[j + 1] = array[j]", pointers: [pointer(j, "j"), pointer(j + 1, "j + 1")], compare: [j, j + 1], sorted: prefix(i) }));
            j--;
        }
        a[j + 1] = key;
        steps.push(snapshot(a, `Insert ${key} at index ${j + 1}.`, { code: "array[j + 1] = key", pointers: [pointer(j + 1, "insert")], compare: [j + 1], sorted: prefix(i + 1) }));
    }
    steps.push(snapshot(a, "Array sorted ✓", { code: "Insertion Sort complete", sorted: prefix(n) }));
    return steps;
}

export function mergeSort(input) {
    const a = [...input], steps = [], n = a.length;
    const indices = (start, end) => Array.from({ length: end - start + 1 }, (_, i) => start + i);
    const view = (phase, left, right, output = [], leftIndex = -1, rightIndex = -1, note = "") => ({
        phase, left: [...left], right: [...right], output: [...output],
        leftIndex, rightIndex, note
    });

    function merge(left, mid, right) {
        const leftPart = a.slice(left, mid + 1);
        const rightPart = a.slice(mid + 1, right + 1);
        const range = indices(left, right);
        const output = [];
        let i = 0, j = 0, k = left;

        steps.push(snapshot(a, `Now merge the two sorted halves: [${leftPart.join(", ")}] and [${rightPart.join(", ")}].`, {
            code: "merge(left, middle, right)", range,
            mergeView: view("merge", leftPart, rightPart, output, i, j, "Both halves are sorted. Compare their first unused values.")
        }));

        while (i < leftPart.length && j < rightPart.length) {
            steps.push(snapshot(a, `${leftPart[i]} vs ${rightPart[j]} — compare the first unused value in each half.`, {
                code: "if (left[i] <= right[j])", compare: [left + i, mid + 1 + j], range,
                mergeView: view("compare", leftPart, rightPart, output, i, j, `Compare ${leftPart[i]} and ${rightPart[j]}.`)
            }));
            if (leftPart[i] <= rightPart[j]) output.push(leftPart[i++]);
            else output.push(rightPart[j++]);
            a[k++] = output[output.length - 1];
            steps.push(snapshot(a, `Write ${output[output.length - 1]} into the result.`, {
                code: "result.push(smaller value)", compare: [k - 1], range,
                mergeView: view("write", leftPart, rightPart, output, i, j, `${output[output.length - 1]} was the smaller value, so it goes next.`)
            }));
        }

        while (i < leftPart.length) {
            output.push(leftPart[i++]);
            a[k++] = output[output.length - 1];
            steps.push(snapshot(a, `Copy ${output[output.length - 1]} from the left half; the right half is exhausted.`, {
                code: "copy remaining left values", compare: [k - 1], range,
                mergeView: view("copy", leftPart, rightPart, output, i, j, "No right-side values remain, so copy the left side in order.")
            }));
        }
        while (j < rightPart.length) {
            output.push(rightPart[j++]);
            a[k++] = output[output.length - 1];
            steps.push(snapshot(a, `Copy ${output[output.length - 1]} from the right half; the left half is exhausted.`, {
                code: "copy remaining right values", compare: [k - 1], range,
                mergeView: view("copy", leftPart, rightPart, output, i, j, "No left-side values remain, so copy the right side in order.")
            }));
        }
        steps.push(snapshot(a, `Merged result: [${output.join(", ")}].`, {
            code: "copy result back into the array", sorted: range,
            mergeView: view("done", leftPart, rightPart, output, i, j, "This whole range is now sorted.")
        }));
    }

    function divide(left, right) {
        if (left >= right) {
            if (left === right) steps.push(snapshot(a, `${a[left]} is alone, so this part is already sorted.`, {
                code: "if (left >= right) return", range: [left], sorted: [left],
                mergeView: view("base", [a[left]], [], [a[left]], 0, -1, "A one-element array is already sorted.")
            }));
            return;
        }
        const mid = Math.floor((left + right) / 2);
        const leftPart = a.slice(left, mid + 1), rightPart = a.slice(mid + 1, right + 1);
        steps.push(snapshot(a, `Divide [${a.slice(left, right + 1).join(", ")}] into two smaller parts.`, {
            code: "middle = floor((left + right) / 2)", range: indices(left, right),
            mergeView: view("divide", leftPart, rightPart, [], -1, -1, "Keep dividing each part until every part has one value.")
        }));
        divide(left, mid);
        divide(mid + 1, right);
        merge(left, mid, right);
    }

    divide(0, n - 1);
    steps.push(snapshot(a, "Array sorted ✓ Every part has been merged in order.", {
        code: "Merge Sort complete", sorted: prefix(n),
        mergeView: view("complete", a, [], a, -1, -1, "All values are now in ascending order.")
    }));
    return steps;
}

export function quickSort(input) {
    const a = [...input], steps = [], n = a.length;
    function partition(low, high) {
        const pivot = a[high]; let i = low - 1;
        steps.push(snapshot(a, `Choose ${pivot} as the pivot.`, { code: "pivot = array[high]", pointers: [pointer(high, "pivot")], range: Array.from({length:high-low+1},(_,x)=>low+x) }));
        for (let j = low; j < high; j++) {
            steps.push(snapshot(a, `Compare ${a[j]} with pivot ${pivot}.`, { code: "if (array[j] <= pivot)", pointers: [pointer(j, "j"), pointer(high, "pivot")], compare: [j, high], range: Array.from({length:high-low+1},(_,x)=>low+x) }));
            if (a[j] <= pivot) {
                i++;
                if (i !== j) {
                    [a[i], a[j]] = [a[j], a[i]];
                    steps.push(snapshot(a, "Move value into the lower partition.", { code: "swap(array[i], array[j])", pointers: [pointer(i, "i"), pointer(j, "j")], compare: [i, j], range: Array.from({length:high-low+1},(_,x)=>low+x) }));
                }
            }
        }
        [a[i + 1], a[high]] = [a[high], a[i + 1]];
        const pivotIndex = i + 1;
        steps.push(snapshot(a, `Pivot ${pivot} is placed at index ${pivotIndex}.`, { code: "swap(array[i + 1], array[high])", pointers: [pointer(pivotIndex, "pivot")], compare: [pivotIndex], sorted: [pivotIndex] }));
        return pivotIndex;
    }
    function sort(low, high) {
        if (low > high) return;
        if (low === high) { steps.push(snapshot(a, `${a[low]} is in its final position.`, { code: "single-element range is sorted", sorted: [low] })); return; }
        const p = partition(low, high);
        sort(low, p - 1); sort(p + 1, high);
    }
    sort(0, n - 1);
    steps.push(snapshot(a, "Array sorted ✓", { code: "Quick Sort complete", sorted: prefix(n) }));
    return steps;
}
