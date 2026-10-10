import { bubbleSort, selectionSort, insertionSort, mergeSort, quickSort } from "./algorithms/sorting.js";
import { linearSearch, binarySearch } from "./algorithms/searching.js";
import { render, renderInitial } from "./visualization/renderer.js";
import { play } from "./visualization/animator.js";

const $ = id => document.getElementById(id);
const algorithm = $("algorithm");
const randomize = $("randomize");
const start = $("start");
const pause = $("pause");
const previous = $("previous");
const next = $("next");
const speed = $("speed");
const title = $("algorithm-title");
const description = $("algorithm-description");
const timeComplexity = $("time-complexity");
const spaceComplexity = $("space-complexity");

const algorithms = {
    "Bubble Sort": { run: bubbleSort, description: "Compares adjacent values and swaps them when they are out of order.", time: "O(n²)", space: "O(1)", type: "sort" },
    "Selection Sort": { run: selectionSort, description: "Finds the smallest value in the unsorted region and places it at the front.", time: "O(n²)", space: "O(1)", type: "sort" },
    "Insertion Sort": { run: insertionSort, description: "Builds a sorted prefix by inserting each new value into its correct position.", time: "O(n²)", space: "O(1)", type: "sort" },
    "Merge Sort": { run: mergeSort, description: "Divides the array into smaller parts, sorts them, and merges the sorted parts.", time: "O(n log n)", space: "O(n)", type: "sort" },
    "Quick Sort": { run: quickSort, description: "Partitions values around a pivot, then sorts the partitions recursively.", time: "O(n log n) average", space: "O(log n) average", type: "sort" },
    "Linear Search": { run: linearSearch, description: "Checks each element in order until the target is found or the array ends.", time: "O(n)", space: "O(1)", type: "search" },
    "Binary Search": { run: binarySearch, description: "Repeatedly halves a sorted search range. The array is sorted automatically for this demonstration.", time: "O(log n)", space: "O(1)", type: "search" }
};

let originalArray = [];
let array = [];
let steps = [];
let currentStep = 0;
let target = null;
let sorting = false;
let paused = false;
let runId = 0;

function currentAlgorithm() { return algorithms[algorithm.value]; }

function updateInfo() {
    const info = currentAlgorithm();
    title.textContent = algorithm.value;
    description.textContent = info.description;
    timeComplexity.textContent = info.time;
    spaceComplexity.textContent = info.space;
}

function createArray() {
    const size = Math.floor(Math.random() * 6) + 5;
    originalArray = Array.from({ length: size }, () => Math.floor(Math.random() * 99) + 1);
    target = null;
    const info = currentAlgorithm();

    if (info.type === "search") {
        if (algorithm.value === "Binary Search") originalArray.sort((a, b) => a - b);
        target = originalArray[Math.floor(Math.random() * originalArray.length)];
        steps = info.run(originalArray, target);
    } else {
        steps = info.run(originalArray);
    }

    array = [...originalArray];
    currentStep = 0;
    sorting = false;
    paused = false;
    pause.textContent = "Pause";
    renderInitial(array, steps.length, target);
    updateControls();
}

function showStep() {
    if (currentStep === 0) {
        array = [...originalArray];
        renderInitial(array, steps.length, target);
    } else {
        const step = steps[currentStep - 1];
        array = [...step.array];
        render(array, step, currentStep, steps.length, target);
    }
    updateControls();
}

function advance() {
    if (currentStep >= steps.length) return;
    currentStep++;
    showStep();
}

function goBack() {
    if (sorting || currentStep === 0) return;
    currentStep--;
    showStep();
}

async function startPlayback() {
    sorting = true;
    paused = false;
    pause.textContent = "Pause";
    const thisRun = ++runId;
    updateControls();
    await play({
        getStep: () => currentStep,
        totalSteps: () => steps.length,
        advance,
        isPaused: () => paused,
        isRunning: () => sorting,
        speed: () => speed.value,
        isCurrentRun: () => thisRun === runId
    });
    if (thisRun === runId) {
        sorting = false;
        paused = false;
        pause.textContent = "Pause";
        updateControls();
    }
}

function updateControls() {
    previous.disabled = sorting || currentStep === 0;
    next.disabled = sorting || currentStep >= steps.length;
    start.disabled = sorting || currentStep >= steps.length;
    randomize.disabled = sorting;
    algorithm.disabled = sorting;
    pause.disabled = !sorting;
}

start.addEventListener("click", () => {
    if (!sorting && currentStep < steps.length) startPlayback();
});
pause.addEventListener("click", () => {
    if (!sorting) return;
    paused = !paused;
    pause.textContent = paused ? "Resume" : "Pause";
});
next.addEventListener("click", () => {
    if (!sorting) advance();
});
previous.addEventListener("click", goBack);
randomize.addEventListener("click", createArray);
algorithm.addEventListener("change", () => { runId++; updateInfo(); createArray(); });

updateInfo();
createArray();
