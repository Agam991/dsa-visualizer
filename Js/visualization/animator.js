export function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export async function play({ getStep, totalSteps, advance, isPaused, isRunning, speed, isCurrentRun }) {
    while (getStep() < totalSteps()) {
        if (!isCurrentRun() || !isRunning()) return;
        while (isPaused() && isRunning() && isCurrentRun()) await wait(80);
        if (!isRunning() || !isCurrentRun()) return;
        advance();
        await wait(Number(speed()));
    }
}
