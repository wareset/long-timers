# long-timers

Timeout and interval greater than 24 days without time discrepancy.

## Зачем?

Стандартные `setTimeout`и `setInterval` могут принимать задержку на выполнение не более, примерно, 24 дней, 20 часов и 30 минут (2 ^ 31 - 1). Если нужно выполнять какие-либо функции с большим интервалом, например раз в 4 недели, то данная библиотека как раз для этого.

Зачем нужна еще одна библиотека, если уже 10 лет существует [long-timeout](https://www.npmjs.com/package/long-timeout)?

Из-за реализации `setInterval`.

`setInterval` в `long-timeout` реализован не совсем так как в `Nodejs` или в браузере. А поведение `setInterval` в `Nodejs`, в свою очередь, так же отличается от поведения в браузере.

#### В браузерах:

В браузерах `setInterval` всегда пытается выполнятся с одинаковыми промежутками, независимо от времени выполнения переданной в него функции. Например, если мы выставили выполнение интервала каждый час в 06:47:29.145, то в идеале (если стек браузера свободен и браузер не заблокирован, например вызовом `alert()`) он выполнится ровно в 07:47:29.145 (возможно +0.001 секунда) и так далее. И даже спустя сутки он так же будет выполняться ровно каждый час в одно и то же время и так же снова выполнится точно в 07:47:29.145.

#### В Nodejs:

В `Nodejs` следующий таймер на выполнение выставляется непосредственно перед выполнением переданной в него функции. Фактически `setInterval` из `Nodejs` можно сымитировать примерно так:

```js
function loop() {
  // Сразу выставляем следующий таймер
  setTimeout(loop, 1000)
  // А уже далее выполняем весь остальной код
  console.log(performance.now())
}
setTimeout(loop, 1000)
```

Из-за накладных расходов на выполнение кода, а так же разных сайд-эффектов, влияющих на ЦП, задержка времени для следующего выполнения функции, переданной в `setInterval`, может постоянно смещаться на 0.001 секунду, в лучшем случае, или еще больше, в зависимости от загрузки ЦП.

#### В long-timeout:

В `long-timeout` следующий таймер на выполнение выставляется только после выполнения переданной в него функции. Другими словами, если функция содержит какой-то "тяжёлый" код (например, синхронное/блокирующее чтение, преобразование и сохранение каких-нибудь лог-файлов), который выполняется около 10 секунд, то задержка времени для следующего выполнения функции будет постоянно смещаться примерно на эти самые 10 секунд.

#### В данной библиотеке:

В данной библиотеке `wareset/long-timers` (через `performance.now()` или `Date.now()`) реализован механизм постоянной коррекции времени выполнения, таким образом, что поведение `setLongInterval` полностью имитирует поведение `setInterval` в браузерах.

Поэтому её можно использовать не только для выполнения на длительных интервалах, но так же и для любых других коротких на `Nodejs`, где требуется постоянная высокая точность времени выполнения.

## Установка

Этой библиотеки нет в `npm`, поэтому для её установки нужно прописать в `package.json`:

package.json

```json
{
  "dependencies": {
    "long-timers": "github:wareset/long-timers"
  }
}
```

Или выполнить команду:

```bash
npm i github:wareset/long-timers
```

## Интерфейс

В библиотеку входят функции `setLongTimeout` и `setLongInterval`, которые возвращают объект класса `LongTimeout`, похожий на тот, что возвращается в `Nodejs`, а так же `clearLongTimeout` и `clearLongInterval` для отмены таймаута или интервала.

```typescript
class LongTimeout {
  /**
   * Отменить таймаут/интервал.
   */
  close(): this
  /**
   * Перезапустить таймаут/интервал.
   */
  refresh(): this
  /**
   * Для Nodejs.
   * Будет ли Nodejs ждать пока существует таймаут/интервал.
   * По умолчанию равен 'true'.
   */
  hasRef(): boolean
  /**
   * Работает только в Nodejs.
   * Nodejs не остановится пока существует таймаут/интервал.
   */
  ref(): this
  /**
   * Работает только в Nodejs.
   * Nodejs может завершиться не дожидаясь таймаут/интервал.
   */
  unref(): this
}

function setLongTimeout(
  // вызываемая функция
  callback: (this: LongTimeout, ...args) => any,
  // задержка в миллисекундах
  delay?: number,
  // аргументы вызываемой функции 'callback'
  ...args
): LongTimeout

function setLongInterval(
  // вызываемая функция
  callback: (this: LongTimeout, ...args) => any,
  // задержка в миллисекундах
  delay?: number,
  // аргументы вызываемой функции 'callback'
  ...args
): LongTimeout

// Отменяет таймаут или интервал
function clearLongTimeout(longTimeoutOrInterval: LongTimeout): void

// Отменяет таймаут или интервал
function clearLongInterval(longTimeoutOrInterval: LongTimeout): void
```

### Пример:

```js
import * as longTimers from 'long-timers'

// Задержка в 4 недели
const delay = 1000 * 60 * 60 * 24 * 28

// Таймаут
const timeoutObj = longTimers.setLongTimeout(
  function (some_arg_1, some_arg_2) {
    // Если понадобится запустить таймаут повторно
    if (need_refresh_timeout) {
      this.refresh()
      // Подобное действие, фактически, будет повторять
      // поведение 'setInterval' в 'Nodejs'
    }

    console.log(performance.now(), some_arg_1, some_arg_2)
  },
  delay,
  1,
  2
)

// Можно вызвать unref(), чтобы Nodejs не дожидалась данный таймаут.
// В браузере от этого ничего не произойдёт и ничего не сломается.
timeoutObj.unref()

// Интервал
const intervalObj = longTimers.setLongInterval(
  function (some_arg_1, some_arg_2) {
    // Если понадобится остановить интервал
    if (need_close_interval) {
      this.close()
      // или
      longTimers.clearLongInterval(this)
      // или
      // в 'long-timeout', кстати, так не сработает
      longTimers.clearLongInterval(li_obj)
    }

    console.log(performance.now(), some_arg_1, some_arg_2)
  },
  delay,
  1,
  2
)
```

## Зачем?

## License

[MIT](LICENSE)
