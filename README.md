# corrente-de-responsabilidade

Implementando padrão corrente de responsabilidade ná prática

Palavras Chaves:

-   Sequencial
-   Ordenado
-   Dinamico

Raise error:

-   curl -i -X DELETE "http://localhost:3000/hello"
    > property of undefined
-   curl -i -X GET "http://localhost:3000/hello?name=Foo&age=42"
    > zod strict error
-   curl -i -X POST "http://localhost:3000/hello?name=foo"
    > unknown error
-   curl -i -X GET "http://localhost:3000/hello?name=bob"
    > bob is blacklisted

refs:

-   https://refactoring.guru/design-patterns/chain-of-responsibility
-   https://github.com/RefactoringGuru/design-patterns-typescript/blob/main/src/ChainOfResponsibility/RealWorld/index.ts
