import { PlasmicCanvasContext } from "@plasmicapp/host";
import React from "react";
import { supabase } from "../../util/supabaseClient";
import { useAllContexts } from "./Contexts";
import { getPropValue } from "./DatabaseComponents";

export interface RedirectIfProps {
  children?: any;
  className?: string;
  leftExpression?: string;
  operator?: any;
  redirectUrl?: string;
  rightExpression?: string;
}

export function RedirectIf(props: RedirectIfProps) {
  const {
    children,
    className,
    leftExpression,
    operator,
    redirectUrl,
    rightExpression,
  } = props;
  const [loaded, setLoaded] = React.useState<boolean>(false);
  const contexts = useAllContexts();
  const [condition, setCondition] = React.useState<boolean>(false);
  const ref = React.createRef<HTMLAnchorElement>();
  const inEditor = React.useContext(PlasmicCanvasContext);

  // Reset the condition if expressions change
  React.useEffect(() => {
    setCondition(false);
  }, [leftExpression, rightExpression, operator, children]);

  // Give time for auth to complete
  setTimeout(() => {
    setLoaded(true);
  }, 500);

  // Check if signed out
  React.useEffect(() => {
    supabase.auth.onAuthStateChange((e) => {
      if (e === "SIGNED_OUT") setCondition(false);
    });
  }, []);

  // Perform redirect
  React.useEffect(() => {
    if (condition && loaded && !inEditor) {
      ref.current?.click();
    }
  }, [loaded, condition, ref, inEditor]);

  // Validation
  if (!leftExpression) {
    return <p>You need to set the leftExpression prop</p>;
  } else if (!operator) {
    return <p>You need to set the operator prop</p>;
  } else if (operator !== "FALSY" && operator !== "TRUTHY") {
    return <p>You need to set the rightExpression prop</p>;
  } else if (!redirectUrl) {
    return <p>You need to set the redirectUrl prop</p>;
  }

  // Set the condition
  const leftVal = getPropValue(leftExpression, contexts);
  if (!condition) {
    if (operator === "FALSY" && !leftVal) {
      setCondition(true);
    } else if (operator === "TRUTHY") {
      if (!!leftVal) {
        setCondition(true);
      }
      const rightVal = getPropValue(rightExpression ?? "", contexts);
      if (leftVal === rightVal) {
        setCondition(true);
      }
    }
  }

  return (
    <div className={className}>
      {children}
      <a href={redirectUrl} hidden={true} ref={ref} />
    </div>
  );
}