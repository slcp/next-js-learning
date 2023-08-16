import { NextjsSite, StackContext } from "sst/constructs";

export function API({ stack }: StackContext) {
  // Create the Next.js site
  const site = new NextjsSite(stack, "Site", {
    path: "../front-end",
  });

  // Add the site's URL to stack output
  stack.addOutputs({
    URL: site.url,
  });
}
