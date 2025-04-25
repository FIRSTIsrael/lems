import { ReactNode, useContext, type JSX } from 'react';
import { animated, useSpring } from 'react-spring';
import { useSteps } from '../hooks/use-steps';
import { SlideContext } from './slide';

type SteppedComponentProps = {
  id?: string | number;
  priority?: number;
  children: ReactNode | ((step: number, isActive: boolean) => ReactNode);
  className?: string;
  tagName?: keyof JSX.IntrinsicElements;
  activeStyle?: Partial<React.CSSProperties>;
  inactiveStyle?: Partial<React.CSSProperties>;
  numSteps?: number;
  alwaysAppearActive?: boolean;
};

const SteppedComponent: React.FC<SteppedComponentProps> = ({
  id,
  className,
  children: childrenOrRenderFunction,
  tagName = 'div',
  priority,
  numSteps = 1,
  alwaysAppearActive = false,
  activeStyle = { opacity: '1' },
  inactiveStyle = { opacity: '0' }
}) => {
  const slideContext = useContext(SlideContext);
  if (slideContext === null) {
    throw new Error(
      'This component must be used within a SlideContext.Provider. Did you' +
        ' put an <Appear> or <Stepper> component outside of a <Slide>?'
    );
  }

  const { immediate } = slideContext;

  const { isActive, step, placeholder } = useSteps(numSteps, {
    id,
    priority
  });

  const AnimatedEl = animated[tagName];

  let children: ReactNode;
  if (typeof childrenOrRenderFunction === 'function') {
    children = childrenOrRenderFunction(step, isActive);
  } else {
    children = childrenOrRenderFunction;
  }

  const springStyle = useSpring({
    to: (isActive ? activeStyle : inactiveStyle) as React.CSSProperties,
    immediate
  });

  return (
    <>
      {placeholder}
      {/* @ts-expect-error For some reason react-spring doesn't like children. */}
      <AnimatedEl
        style={alwaysAppearActive ? (activeStyle as React.CSSProperties) : springStyle}
        className={className}
        data-testid="AppearElement"
      >
        {children}
      </AnimatedEl>
    </>
  );
};

type AppearProps = Omit<SteppedComponentProps, 'numSteps' | 'alwaysAppearActive'>;
export const Appear: React.FC<AppearProps> = (props): JSX.Element => {
  const { children, ...restProps } = props;
  return (
    <SteppedComponent {...restProps} numSteps={1}>
      {children}
    </SteppedComponent>
  );
};

type StepperProps<T extends unknown[] = unknown[]> = {
  id?: string | number;
  priority?: number;
  render?: (value: T[number], step: number, isActive: boolean) => ReactNode;
  children?: (value: T[number], step: number, isActive: boolean) => ReactNode;
  className?: string;
  tagName?: keyof JSX.IntrinsicElements;
  values: T;
  alwaysVisible?: boolean;
  activeStyle?: Partial<React.CSSProperties>;
  inactiveStyle?: Partial<React.CSSProperties>;
};

export const Stepper: React.FC<StepperProps> = ({
  values,
  render: renderFn,
  children: renderChildrenFn,
  alwaysVisible = false,
  ...props
}): JSX.Element => {
  if (renderFn !== undefined && renderChildrenFn !== undefined) {
    throw new Error(
      '<Stepper> component specified both `render` prop and a render function as its `children`.'
    );
  }

  return (
    <SteppedComponent {...props} numSteps={values.length} alwaysAppearActive={alwaysVisible}>
      {(step, isActive) => (renderFn || renderChildrenFn!)(values[step], step, isActive)}
    </SteppedComponent>
  );
};
