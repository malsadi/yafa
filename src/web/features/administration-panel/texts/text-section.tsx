import type { ReactNode } from 'react';

/** One text on the Texts screen: its name, what it is for, and its form. */
export function TextSection(props: { title: string; intro: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-lg font-semibold">{props.title}</h2>
      <p className="max-w-prose">{props.intro}</p>
      {props.children}
    </section>
  );
}
