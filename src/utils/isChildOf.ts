export const isChildOf = (el: HTMLElement, parent: HTMLElement): boolean => {
    if (el.parentElement === parent) {
        return true;
    }
    if (el.parentElement) {
        return isChildOf(el.parentElement, parent);
    }
    return false;
};
