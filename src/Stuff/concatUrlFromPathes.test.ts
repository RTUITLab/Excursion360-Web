import { expect, test } from 'vitest'
import { concatUrlFromPathes } from './concatUrlFromPathes'

test("Простое сложение путей", () => {
  expect(concatUrlFromPathes("foo", "bar")).toBe("foo/bar")
})

test("Если во втором есть /", () => {
  expect(concatUrlFromPathes("foo", "/bar")).toBe("foo/bar")
})

test("Если в первом есть /", () => {
  expect(concatUrlFromPathes("foo/", "bar")).toBe("foo/bar")
})

test("Если в обоих есть /", () => {
  expect(concatUrlFromPathes("foo/", "/bar")).toBe("foo/bar")
})

test("Стартовый / не обрабатывается", () => {
  expect(concatUrlFromPathes("/foo", "bar")).toBe("/foo/bar")
})

test("Конечный / не обрабатывается", () => {
  expect(concatUrlFromPathes("foo", "bar/")).toBe("foo/bar/")
})

test("Множественные / тоже убираются", () => {
  expect(concatUrlFromPathes("foo///", "////bar")).toBe("foo/bar")
})

test("Много путей на всякий случай", () => {
  expect(concatUrlFromPathes("foo", "bar/" , "one", "more")).toBe("foo/bar/one/more")
})

test("Пустой путь в начале не добавляет /", () => {
  expect(concatUrlFromPathes("", "tour.json")).toBe("tour.json")
})

test("Пустота в конце не добавляет /", () => {
  expect(concatUrlFromPathes("some/base", "")).toBe("some/base")
})

test("Пустота в середине не добавляет /", () => {
  expect(concatUrlFromPathes("some/base", "", "", "some", "end")).toBe("some/base/some/end")
})