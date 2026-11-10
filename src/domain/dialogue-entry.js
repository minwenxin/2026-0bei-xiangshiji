let pending=false
export function enterCookingFromDialogue(){pending=true}
export function consumeDialogueEntry(){const value=pending;pending=false;return value}
