---
title: some thought about typescript
date: "2022-09-01T02:32:17.379Z"
description: "My thought about typescript"
tags: ["writing", "typescript"]
private: true
---

typescript 的評價一直都滿兩極的，經常會在社群等地方看到許多人對於 typescript 的怨言，像是團隊花了很多時間在琢磨 type；修改了一些東西結果 type 全部壞掉了，需要改一堆東西；type 沒有真正的反映出資料現在的型態，這個問題其實似曾相識，在 TDD 也經常看到這類的問題，我寫了 typescript 有差不多四年以上的時間了，我認為問題在於開發時的順序出了錯誤，才導致這樣的問題。

就如同 TDD 要求測試先行一樣，我認為在使用 typescript 的時候，需要 type 先行，也就是需要先定義好型態之後，再去做開發，讓資料反映型態，而不是開發完之後，再把型態加上去，從 javascript 轉到 typescript 的過程中，會非常的不習慣，即便是長期使用 typescript 的開發者，我相信都很難做到，我直到今日，都還會從資料本位思考，這時候 type 就成為了阻力。

舉個例子，假設我們有一個資料申請流程，裡面有三個步驟，每個步驟都要填一張表單，最後我們會把這個三個表單的資料整理成一份，送給 api，以下是各個步驟的功能。

1. 填寫信箱，姓名
2. 填寫公司名稱，人數
3. 填寫申請動機

我們可以從上面得知我們每個表單的資料型態如下。

```
interface UserForm {
  email: string;
  name: string;
}

interface CompanyForm {
  company: string;
  amountOfPeople: number;
}

interface ReasonForm {
  reason: string;
}
```

最後我們會統合成一張表單。

```
type ApplicationForm = UserForm & CompanyForm & ReasonForm;
```

型別定義好了之後，我們來看看如何用 javascript 完成這個申請流程的元件。

```
function ApplicationWizard() {
  const [form, setForm] = useState({});

	const handleNext = (form) => {
	  setForm(prev => ({ ...prev, ...form }));
	};
	
	const handleSubmit = (reasonForm) => {
		submit({ ...form, ...reasonForm });
	};

  return (
    <Wizard>
      <Wizard.Step>
        <UserFormView form={form} onNext={handleNext} />
      </Wizard.Step>
      <Wizard.Step>
        <CompanyFormView form={form} onNext={handleNext} />
      </Wizard.Step>
      <Wizard.Step>
        <ReasonFormView form={form} onNext={handleSubmit} />
      </Wizard.Step>
    </Wizard>
  );
}
```

如果是 javascript 的話，上面其實就完成了差不多了，但在 typescript 中，這樣是不夠的，我們沒有定義 form 的型別，不過這邊沒辦法簡單的將 form 的型別定義為 `ApplicationForm`，因為在最開始的時候， form 是空的，還沒有任何資料，這型態不符合 `ApplicationForm` ，這時候我們就會開始為了讓 typescript 不抱怨，加上 `any` 或者是開始靠杯。

如果從 type 的角度來思考這申請流程，我們可以發現每經過一個表單，資料都會更加齊全，也就是 form 具有不只一個 type ，經過修改後，我們可以定義出 form 的 type。

```
type Step1InputForm = {};
type Step1OutputForm = UserForm;
type Step2OutputForm = Step1OutputForm & CompanyForm;
type Step3OutputForm = Step2OutputForm & ReasonForm;

function ApplicationWizard() {
  const [form, setForm] = useState<Step1InputForm | Step1OutputForm | Step2OutputForm | Step3OutputForm>({});

  const handleNext = (form: UserForm | CompanyForm) => {
    setForm((prev) => ({ ...prev, ...form }));
  };

  const handleSubmit = (reasonForm: ReasonForm) => {
    submit({ ...form, ...reasonForm });
  };

  return (
    <Wizard>
      <Wizard.Step>
        <UserFormView form={form} onNext={handleNext} />
      </Wizard.Step>
      <Wizard.Step>
        <CompanyFormView form={form} onNext={handleNext} />
      </Wizard.Step>
      <Wizard.Step>
        <ReasonFormView form={form} onNext={handleSubmit} />
      </Wizard.Step>
    </Wizard>
  );
}
```

現在我們面臨到最後一個難題，在 submit 時，我們只接受 `ApplicationForm`，但 form 有可能是 `Step1InputForm | Step1OutputForm` ，在這個情況下，submit 會抱怨我們沒有傳正確的型別，但從程式上來看，我們可以確定這時候資料一定是完整的，這種型別跟我們想的不一樣的情況，正是人們討厭 typescript 的地方。

TODO: how to make the conclusion become the following code?
----

```
import { createContext, ReactNode, useContext, useState } from 'react';

interface UserForm {
  email: string;
  name: string;
}

interface CompanyForm {
  company: string;
  amountOfPeople: number;
}

interface ReasonForm {
  reason: string;
}

type ApplicationForm = UserForm & CompanyForm & ReasonForm;

interface Step1InputForm {};
type Step1OutputForm = UserForm;
type Step2OutputForm = Step1OutputForm & CompanyForm;
type Step3OutputForm = Step2OutputForm & ReasonForm;

function submit(form: ApplicationForm) {}

function ApplicationWizard() {
  const handleSubmit = (input: Step2OutputForm, reasonForm: ReasonForm) => {
    submit({ ...input, ...reasonForm });
  };

  return (
    <Wizard<
      Step1InputForm | Step1OutputForm | Step2OutputForm | Step3OutputForm
    >
      defaultContext={{}}
    >
      <Wizard.Step<Step1InputForm, UserForm>>
        {({ onNext }) => <UserFormView form={{}} onNext={onNext} />}
      </Wizard.Step>
      <Wizard.Step<Step1OutputForm, CompanyForm>>
        {({ onNext, input }) => (
          <CompanyFormView form={input} onNext={onNext} />
        )}
      </Wizard.Step>
      <Wizard.Step<Step2OutputForm, ReasonForm>>
        {({ input }) => <ReasonFormView form={input} onNext={handleSubmit} />}
      </Wizard.Step>
    </Wizard>
  );
}

interface WizardContextValue<Context> {
  onNext: (input: any, output: any) => void;
  context: Context;
}

const WizardContext = createContext<WizardContextValue<any>>(null as any);

function _Wizard<Context>({
  children,
  defaultContext,
}: {
  children: ReactNode;
  defaultContext: Context;
}) {
  const [context, setContext] = useState<Context>(defaultContext);

  return (
    <WizardContext.Provider
      value={{
        onNext: (input, form) => {
          setContext({ ...input, ...form });
        },
        context,
      }}
    >
      {children}
    </WizardContext.Provider>
  );
}

function _WizardStep<Input, Form>({
  children,
}: {
  children: ({
    input,
  }: {
    input: Input;
    onNext: (input: Input, form: Form) => void;
  }) => ReactNode;
}) {
  const { context, onNext } =
    useContext<WizardContextValue<Input>>(WizardContext);
  return <>{children({ input: context, onNext })}</>;
}

const Wizard = Object.assign(_Wizard, { Step: _WizardStep });

function UserFormView({}: {
  form: Step1InputForm;
  onNext: (input: Step1InputForm, form: UserForm) => void;
}) {
  return null;
}

function CompanyFormView({}: {
  form: Step1OutputForm;
  onNext: (input: Step1OutputForm, form: CompanyForm) => void;
}) {
  return null;
}

function ReasonFormView({}: {
  form: Step2OutputForm;
  onNext: (input: Step2OutputForm, form: ReasonForm) => void;
}) {
  return null;
}
```
