const arrayBox = document.getElementById("array");
const condition = document.getElementById("condition");
const stepText = document.getElementById("step");
const codeLine = document.getElementById("code-line");
const targetText = document.getElementById("target");
const mergeWorkspace = document.getElementById("merge-workspace");
const mergePhase = document.getElementById("merge-phase");
const mergeNote = document.getElementById("merge-note");
const mergeLeft = document.getElementById("merge-left");
const mergeRight = document.getElementById("merge-right");
const mergeOutput = document.getElementById("merge-output");

function renderMergeLane(container, values, activeIndex = -1, usedCount = 0) {
    container.innerHTML = "";
    values.forEach((value, index) => {
        const chip = document.createElement("span");
        chip.className = "merge-chip";
        chip.textContent = value;
        if (index === activeIndex) chip.classList.add("merge-current");
        else if (index < usedCount) chip.classList.add("merge-used");
        container.appendChild(chip);
    });
    if (!values.length) {
        const empty = document.createElement("span");
        empty.className = "merge-empty";
        empty.textContent = "—";
        container.appendChild(empty);
    }
}

function renderMergeView(view) {
    mergeWorkspace.hidden = !view;
    if (!view) return;
    const phases = {
        divide: "1. Divide the array",
        base: "2. One value is already sorted",
        merge: "3. Prepare to merge",
        compare: "4. Compare the front values",
        write: "5. Add the smaller value",
        copy: "6. Copy the remaining values",
        done: "7. This part is sorted",
        complete: "Merge Sort complete"
    };
    mergePhase.textContent = phases[view.phase] || "Merge Sort";
    mergeNote.textContent = view.note;
    renderMergeLane(mergeLeft, view.left, view.leftIndex, view.leftIndex);
    renderMergeLane(mergeRight, view.right, view.rightIndex, view.rightIndex);
    renderMergeLane(mergeOutput, view.output);
}

export function render(array, step, currentStep, totalSteps, target = null) {
    arrayBox.innerHTML = "";
    const pointerMap = new Map();
    for (const p of step.pointers || []) {
        if (!pointerMap.has(p.index)) pointerMap.set(p.index, []);
        pointerMap.get(p.index).push(p.label);
    }

    array.forEach((value, index) => {
        const item = document.createElement("div");
        item.className = "item";
        const labels = pointerMap.get(index) || [];
        if (labels.length) {
            const pointerBox = document.createElement("div");
            pointerBox.className = "pointer-box";
            labels.forEach(labelText => {
                const label = document.createElement("div");
                label.className = "pointer";
                label.textContent = labelText;
                pointerBox.appendChild(label);
            });
            item.appendChild(pointerBox);
        }

        const cell = document.createElement("div");
        cell.className = "cell";
        cell.textContent = value;
        if ((step.compare || []).includes(index)) cell.classList.add("compare");
        if ((step.sorted || []).includes(index)) cell.classList.add("sorted");
        if ((step.found || []).includes(index)) cell.classList.add("found");
        if ((step.range || []).includes(index)) cell.classList.add("in-range");
        item.appendChild(cell);

        const indexLabel = document.createElement("div");
        indexLabel.className = "index";
        indexLabel.textContent = index;
        item.appendChild(indexLabel);
        arrayBox.appendChild(item);
    });

    condition.textContent = step.condition;
    stepText.textContent = `Step ${currentStep} / ${totalSteps}`;
    codeLine.textContent = step.code || "—";
    targetText.textContent = target === null ? "" : `Target: ${target}`;
    renderMergeView(step.mergeView || null);
}

export function renderInitial(array, totalSteps, target = null) {
    render(array, {
        condition: "Ready", code: "Choose Next Step or Start.",
        pointers: [], compare: [], sorted: [], found: [], range: []
    }, 0, totalSteps, target);
}
