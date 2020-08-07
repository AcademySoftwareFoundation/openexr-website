export declare type FunctionType<I, O> = (input: I) => O;
export default function cachedFunction<I, O>(f: FunctionType<I, O>): FunctionType<I, O>;
