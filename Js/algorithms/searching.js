function snapshot(array, condition, options = {}) {
    return {
        array: [...array], condition, code: options.code || "",
        pointers: options.pointers || [], compare: options.compare || [],
        sorted: [], found: options.found || [], range: options.range || []
    };
}
const pointer = (index, label) => ({ index, label });

export function linearSearch(array, target) {
    const steps = [];
    for (let i = 0; i < array.length; i++) {
        steps.push(snapshot(array, `Check whether ${array[i]} equals target ${target}.`, { code: "if (array[i] === target)", pointers: [pointer(i, "i")], compare: [i] }));
        if (array[i] === target) {
            steps.push(snapshot(array, `Found ${target} at index ${i} ✓`, { code: "return i", pointers: [pointer(i, "found")], found: [i] }));
            return steps;
        }
        steps.push(snapshot(array, `${array[i]} is not the target. Continue.`, { code: "move to the next index", pointers: [pointer(i, "i")], compare: [i] }));
    }
    steps.push(snapshot(array, `Target ${target} was not found.`, { code: "return -1" }));
    return steps;
}

export function binarySearch(input, target) {
    const array = [...input].sort((a, b) => a - b);
    const steps = [];
    let low = 0, high = array.length - 1;
    while (low <= high) {
        const mid = Math.floor((low + high) / 2);
        steps.push(snapshot(array, `Compare middle value ${array[mid]} with target ${target}.`, { code: "mid = floor((low + high) / 2)", pointers: [pointer(low, "low"), pointer(mid, "mid"), pointer(high, "high")], compare: [mid], range: Array.from({length:high-low+1},(_,x)=>low+x) }));
        if (array[mid] === target) {
            steps.push(snapshot(array, `Found ${target} at index ${mid} ✓`, { code: "return mid", pointers: [pointer(mid, "found")], found: [mid] }));
            return steps;
        }
        if (array[mid] < target) {
            low = mid + 1;
            steps.push(snapshot(array, `Target is larger; discard the left half.`, { code: "low = mid + 1", pointers: low < array.length ? [pointer(low, "low")] : [], range: Array.from({length:Math.max(0,high-low+1)},(_,x)=>low+x) }));
        } else {
            high = mid - 1;
            steps.push(snapshot(array, `Target is smaller; discard the right half.`, { code: "high = mid - 1", pointers: high >= 0 ? [pointer(high, "high")] : [], range: Array.from({length:Math.max(0,high-low+1)},(_,x)=>low+x) }));
        }
    }
    steps.push(snapshot(array, `Target ${target} was not found.`, { code: "return -1" }));
    return steps;
}
