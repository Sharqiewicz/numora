export type QuickstartPackage = 'numora-react' | 'numora';

interface Prompt {
  intro: string;
  steps: string[];
  outro: string;
}

const RELEASE_AGE =
  'If a release-age policy blocks the install, stop and ask me instead of changing it.';

const SKIP = 'Leave phone numbers, one-time codes and card numbers alone.';

/** The agent prompt that installs a package and swaps the app's numeric inputs for Numora. */
export function quickstartPrompt(pkg: QuickstartPackage): Prompt {
  const react = pkg === 'numora-react';
  return {
    intro: react
      ? 'Set up Numora in this React project. It needs React 17 or newer.'
      : 'Set up Numora in this project.',
    steps: [
      `Install \`${pkg}\` with the project's package manager. ${RELEASE_AGE}`,
      react
        ? 'Read `node_modules/numora-react/README.md` before writing code.'
        : 'Read `node_modules/numora/README.md` and https://numeric-input.com/llms.txt before writing code.',
      react
        ? `Replace every input that holds an amount, price or quantity with \`<NumoraInput>\`. ${SKIP}`
        : `Attach \`new NumoraInput(element, options)\` to every input that holds an amount, price or quantity, and call \`destroy()\` when it unmounts. ${SKIP}`,
      'Keep each value as a string: store `value` from `onValueChange`. Set `decimalMaxLength` to what the field holds.',
      "Run the project's typecheck and build, and make sure they pass.",
    ],
    outro: "When you're done, list the inputs you replaced.",
  };
}

/** The exact text that lands on the clipboard. */
export function quickstartPromptText(pkg: QuickstartPackage): string {
  const p = quickstartPrompt(pkg);
  return [p.intro, '', ...p.steps.map((s, i) => `${i + 1}. ${s}`), '', p.outro].join('\n');
}
