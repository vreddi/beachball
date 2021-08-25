import { gatherBumpInfo } from '../bump/gatherBumpInfo';
import { performBump } from '../bump/performBump';
import { BeachballOptions2 } from '../options/BeachballOptions2';

export async function bump(options: BeachballOptions2) {
  return await performBump(gatherBumpInfo(options), options);
}
