export const partition = <T>(arr: T[], predicate: (val: T) => boolean): [matched: T[], unmatched: T[]] => {
    const partitioned: [T[], T[]] = [[], []];
    arr.forEach((val: T) => {
        partitioned[predicate(val) ? 0 : 1].push(val);
    });
    return partitioned;
};
