import 'jest';
import { ArrayDownsamplingFunction } from '../../types';
import { LTOB, createLTOB } from '../LTOB';
import { makeTupleDateTestData, makeTupleNumberTestData, makeXYDateTestData, makeXYNumberTestData } from './utils';
import data from '../../../data/power.json';

describe('LTOB', () => {
  describe('with XYDataPoint with Date', () => testStuff(makeXYDateTestData(data), LTOB));
  describe('with TupleDataPoint with Date', () => testStuff(makeTupleDateTestData(data), LTOB));
  describe('with XYDataPoint with number', () => testStuff(makeXYNumberTestData(data), LTOB));
  describe('with TupleDataPoint with number', () => testStuff(makeTupleNumberTestData(data), LTOB));

  describe('createLTOB', () => {
    describe('with string / number x / y', () => {
      describe('with XYDataPoint with number', () =>
        testStuff(
          makeXYNumberTestData(data),
          createLTOB({
            x: 'x',
            y: 'y',
          }),
        ));
      describe('with TupleDataPoint with number', () =>
        testStuff(
          makeTupleNumberTestData(data),
          createLTOB({
            x: 0,
            y: 1,
          }),
        ));
    });

    describe('with function x / y', () => {
      describe('with XYDataPoint with Date', () =>
        testStuff(
          makeXYDateTestData(data),
          createLTOB({
            x: (value) => value.x.getTime(),
            y: 'y',
          }),
        ));
      describe('with TupleDataPoint with Date', () =>
        testStuff(
          makeTupleDateTestData(data),
          createLTOB({
            x: (value) => value[0].getTime(),
            y: 1,
          }),
        ));
    });
  });

  function testStuff<T>(data: T[], method: ArrayDownsamplingFunction<T, [number]>): void {
    it('should throw an error if desiredLength is negative', () => {
      expect(() => method(data, -1)).toThrow();
    });

    it('should return the whole data set if there are two data points', () => {
      expect(method(data.slice(0, 2), 1)).toHaveLength(2);
    });

    it('should return the whole data set if desiredLength is larger than the data set length', () => {
      expect(method(data, data.length + 40)).toHaveLength(data.length);
    });

    it('should return desired number of data points', () => {
      expect(method(data, 3)).toHaveLength(3);
      expect(method(data, 5)).toHaveLength(5);
      expect(method(data, 7)).toHaveLength(7);
      expect(method(data, 8)).toHaveLength(8);
    });

    it('should preserve the first and last data points', () => {
      expect(method(data, 5)[0]).toEqual(data[0]);
      expect(method(data, 5)[4]).toEqual(data[data.length - 1]);
    });

    it('should downsample correctly', () => {
      expect(method(data, 1)).toMatchSnapshot();
      expect(method(data, 2)).toMatchSnapshot();
      expect(method(data, 5)).toMatchSnapshot();
      expect(method(data, 1000)).toMatchSnapshot();
      expect(method(data, Math.round(data.length / 2))).toMatchSnapshot();
    });
  }
});
