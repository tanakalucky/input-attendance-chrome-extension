import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import z from 'zod';
import { Button } from './components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel
} from './components/ui/form';
import { Input } from './components/ui/input';

const formSchema = z.object({
  start: z.string(),
  end: z.string(),
  rest: z.string()
});

function App() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      start: '09:00',
      end: '18:00',
      rest: '01:00'
    }
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="p-4 space-y-4">
        <FormField
          control={form.control}
          name="start"
          render={({ field }) => (
            <FormItem>
              <FormLabel>開始時刻</FormLabel>
              <FormControl>
                <Input type="time" {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="end"
          render={({ field }) => (
            <FormItem>
              <FormLabel>終了時刻</FormLabel>
              <FormControl>
                <Input type="time" {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="rest"
          render={({ field }) => (
            <FormItem>
              <FormLabel>休憩</FormLabel>
              <FormControl>
                <Input type="time" {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <Button type="submit">入力</Button>
      </form>
    </Form>
  );
}

export default App;

const onSubmit = (values: z.infer<typeof formSchema>): void => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id ?? 0 },
      func: inputAttendance,
      args: [values.start, values.end, values.rest]
    });
  });
};

const inputAttendance = (start: string, end: string, rest: string): void => {
  try {
    // 参照エラー回避のため、関数内で定義
    const getElementByXPath = (xpath: string): Node | null => {
      return document.evaluate(
        xpath,
        document,
        null,
        XPathResult.FIRST_ORDERED_NODE_TYPE,
        null
      ).singleNodeValue;
    };

    const yearSelect = getElementByXPath(
      '/html/body/div/div/div[2]/main/div/div/div/h5/div/form/div/div[2]/select[1]'
    );
    if (!yearSelect || !(yearSelect instanceof HTMLSelectElement)) {
      throw new Error('年の取得に失敗しました');
    }

    const monthSelect = getElementByXPath(
      '/html/body/div/div/div[2]/main/div/div/div/h5/div/form/div/div[2]/select[2]'
    );
    if (!monthSelect || !(monthSelect instanceof HTMLSelectElement)) {
      throw new Error('月の取得に失敗しました');
    }

    const year = Number(yearSelect.value);
    const month = Number(monthSelect.value);
    const days = new Date(year, month, 0).getDate();
    const inputs = Array.from(
      document.getElementsByClassName('form-type-time')
    );

    for (let day = 1; day <= days; day++) {
      const dayOfWeek = new Date(year, month - 1, day).getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) continue;

      const index = (day - 1) * 3;

      const startInput = inputs[index];
      const endInput = inputs[index + 1];
      const restInput = inputs[index + 2];

      if (startInput && startInput instanceof HTMLInputElement) {
        startInput.value = start;
      }
      if (endInput && endInput instanceof HTMLInputElement) {
        endInput.value = end;
      }
      if (restInput && restInput instanceof HTMLInputElement) {
        restInput.value = rest;
      }
    }

    window.alert('入力が完了しました');
  } catch (error) {
    if (error instanceof Error) {
      console.error(error.stack);
    } else {
      console.error('不明なエラー');
    }
    window.alert('問題が起きたため、処理を中断しました');
  }
};
