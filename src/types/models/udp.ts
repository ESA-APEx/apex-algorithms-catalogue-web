export interface UDP {
  process_graph: ProcessGraph
  id: string
  summary: string
  description: string
  parameters: Parameter[]
}

export interface ProcessGraph {
  loadcollection1: Loadcollection1
  filterspatial1: Filterspatial1
  loadcollection2: Loadcollection2
  resamplespatial1: Resamplespatial1
  filterspatial2: Filterspatial2
  apply1: Apply1
  reducedimension1: Reducedimension1
  adddimension1: Adddimension1
  applykernel1: Applykernel1
  apply2: Apply2
  applyneighborhood1: Applyneighborhood1
  apply3: Apply3
  apply4: Apply4
  renamelabels1: Renamelabels1
  apply5: Apply5
  mergecubes1: Mergecubes1
  apply6: Apply6
  aggregatespatial1: Aggregatespatial1
  vectortoraster1: Vectortoraster1
  renamelabels2: Renamelabels2
  apply7: Apply7
  mergecubes2: Mergecubes2
  apply8: Apply8
  reducedimension2: Reducedimension2
  mask1: Mask1
  applyneighborhood2: Applyneighborhood2
  reducedimension3: Reducedimension3
  mask2: Mask2
  mask3: Mask32
  aggregatetemporalperiod1: Aggregatetemporalperiod1
}

export interface Loadcollection1 {
  process_id: string
  arguments: Arguments
}

export interface Arguments {
  bands: Bands
  id: string
  properties: Properties
  spatial_extent: any
  temporal_extent: TemporalExtent
}

export interface Bands {
  from_parameter: string
}

export interface Properties {
  "eo:cloud_cover": EoCloudCover
}

export interface EoCloudCover {
  process_graph: ProcessGraph2
}

export interface ProcessGraph2 {
  lte1: Lte1
}

export interface Lte1 {
  process_id: string
  arguments: Arguments2
  result: boolean
}

export interface Arguments2 {
  x: X
  y: number
}

export interface X {
  from_parameter: string
}

export interface TemporalExtent {
  from_parameter: string
}

export interface Filterspatial1 {
  process_id: string
  arguments: Arguments3
}

export interface Arguments3 {
  data: Data
  geometries: Geometries
}

export interface Data {
  from_node: string
}

export interface Geometries {
  from_parameter: string
}

export interface Loadcollection2 {
  process_id: string
  arguments: Arguments4
}

export interface Arguments4 {
  bands: string[]
  id: string
  properties: Properties2
  spatial_extent: any
  temporal_extent: TemporalExtent2
}

export interface Properties2 {
  "eo:cloud_cover": EoCloudCover2
}

export interface EoCloudCover2 {
  process_graph: ProcessGraph3
}

export interface ProcessGraph3 {
  lte2: Lte2
}

export interface Lte2 {
  process_id: string
  arguments: Arguments5
  result: boolean
}

export interface Arguments5 {
  x: X2
  y: number
}

export interface X2 {
  from_parameter: string
}

export interface TemporalExtent2 {
  from_parameter: string
}

export interface Resamplespatial1 {
  process_id: string
  arguments: Arguments6
}

export interface Arguments6 {
  align: string
  data: Data2
  method: string
  projection: any
  resolution: number
}

export interface Data2 {
  from_node: string
}

export interface Filterspatial2 {
  process_id: string
  arguments: Arguments7
}

export interface Arguments7 {
  data: Data3
  geometries: Geometries2
}

export interface Data3 {
  from_node: string
}

export interface Geometries2 {
  from_parameter: string
}

export interface Apply1 {
  process_id: string
  arguments: Arguments8
}

export interface Arguments8 {
  data: Data4
  process: Process
}

export interface Data4 {
  from_node: string
}

export interface Process {
  process_graph: ProcessGraph4
}

export interface ProcessGraph4 {
  isnan1: Isnan1
  if1: If1
}

export interface Isnan1 {
  process_id: string
  arguments: Arguments9
}

export interface Arguments9 {
  x: X3
}

export interface X3 {
  from_parameter: string
}

export interface If1 {
  process_id: string
  arguments: Arguments10
  result: boolean
}

export interface Arguments10 {
  accept: number
  reject: Reject
  value: Value
}

export interface Reject {
  from_parameter: string
}

export interface Value {
  from_node: string
}

export interface Reducedimension1 {
  process_id: string
  arguments: Arguments11
}

export interface Arguments11 {
  data: Data5
  dimension: string
  reducer: Reducer
}

export interface Data5 {
  from_node: string
}

export interface Reducer {
  process_graph: ProcessGraph5
}

export interface ProcessGraph5 {
  arrayelement1: Arrayelement1
  eq1: Eq1
  eq2: Eq2
  or1: Or1
  eq3: Eq3
  or2: Or2
  eq4: Eq4
  or3: Or3
}

export interface Arrayelement1 {
  process_id: string
  arguments: Arguments12
}

export interface Arguments12 {
  data: Data6
  index: number
}

export interface Data6 {
  from_parameter: string
}

export interface Eq1 {
  process_id: string
  arguments: Arguments13
}

export interface Arguments13 {
  x: X4
  y: number
}

export interface X4 {
  from_node: string
}

export interface Eq2 {
  process_id: string
  arguments: Arguments14
}

export interface Arguments14 {
  x: X5
  y: number
}

export interface X5 {
  from_node: string
}

export interface Or1 {
  process_id: string
  arguments: Arguments15
}

export interface Arguments15 {
  x: X6
  y: Y
}

export interface X6 {
  from_node: string
}

export interface Y {
  from_node: string
}

export interface Eq3 {
  process_id: string
  arguments: Arguments16
}

export interface Arguments16 {
  x: X7
  y: number
}

export interface X7 {
  from_node: string
}

export interface Or2 {
  process_id: string
  arguments: Arguments17
}

export interface Arguments17 {
  x: X8
  y: Y2
}

export interface X8 {
  from_node: string
}

export interface Y2 {
  from_node: string
}

export interface Eq4 {
  process_id: string
  arguments: Arguments18
}

export interface Arguments18 {
  x: X9
  y: number
}

export interface X9 {
  from_node: string
}

export interface Or3 {
  process_id: string
  arguments: Arguments19
  result: boolean
}

export interface Arguments19 {
  x: X10
  y: Y3
}

export interface X10 {
  from_node: string
}

export interface Y3 {
  from_node: string
}

export interface Adddimension1 {
  process_id: string
  arguments: Arguments20
}

export interface Arguments20 {
  data: Data7
  label: string
  name: string
  type: string
}

export interface Data7 {
  from_node: string
}

export interface Applykernel1 {
  process_id: string
  arguments: Arguments21
}

export interface Arguments21 {
  border: number
  data: Data8
  factor: number
  kernel: number[][]
  replace_invalid: number
}

export interface Data8 {
  from_node: string
}

export interface Apply2 {
  process_id: string
  arguments: Arguments22
}

export interface Arguments22 {
  data: Data9
  process: Process2
}

export interface Data9 {
  from_node: string
}

export interface Process2 {
  process_graph: ProcessGraph6
}

export interface ProcessGraph6 {
  subtract1: Subtract1
  multiply1: Multiply1
}

export interface Subtract1 {
  process_id: string
  arguments: Arguments23
}

export interface Arguments23 {
  x: number
  y: Y4
}

export interface Y4 {
  from_parameter: string
}

export interface Multiply1 {
  process_id: string
  arguments: Arguments24
  result: boolean
}

export interface Arguments24 {
  x: number
  y: Y5
}

export interface Y5 {
  from_node: string
}

export interface Applyneighborhood1 {
  process_id: string
  arguments: Arguments25
}

export interface Arguments25 {
  data: Data10
  overlap: any[]
  process: Process3
  size: Size[]
}

export interface Data10 {
  from_node: string
}

export interface Process3 {
  process_graph: ProcessGraph7
}

export interface ProcessGraph7 {
  arrayapply1: Arrayapply1
}

export interface Arrayapply1 {
  process_id: string
  arguments: Arguments26
  result: boolean
}

export interface Arguments26 {
  data: Data11
  process: Process4
}

export interface Data11 {
  from_parameter: string
}

export interface Process4 {
  process_graph: ProcessGraph8
}

export interface ProcessGraph8 {
  datereplacecomponent1: Datereplacecomponent1
  datedifference1: Datedifference1
  add1: Add1
}

export interface Datereplacecomponent1 {
  process_id: string
  arguments: Arguments27
}

export interface Arguments27 {
  component: string
  date: Date
  value: number
}

export interface Date {
  from_parameter: string
}

export interface Datedifference1 {
  process_id: string
  arguments: Arguments28
}

export interface Arguments28 {
  date1: Date1
  date2: Date2
  unit: string
}

export interface Date1 {
  from_node: string
}

export interface Date2 {
  from_parameter: string
}

export interface Add1 {
  process_id: string
  arguments: Arguments29
  result: boolean
}

export interface Arguments29 {
  x: number
  y: Y6
}

export interface Y6 {
  from_node: string
}

export interface Size {
  dimension: string
  unit?: string
  value: any
}

export interface Apply3 {
  process_id: string
  arguments: Arguments30
}

export interface Arguments30 {
  data: Data12
  process: Process5
}

export interface Data12 {
  from_node: string
}

export interface Process5 {
  process_graph: ProcessGraph9
}

export interface ProcessGraph9 {
  multiply2: Multiply2
}

export interface Multiply2 {
  process_id: string
  arguments: Arguments31
  result: boolean
}

export interface Arguments31 {
  x: number
  y: Y7
}

export interface Y7 {
  from_parameter: string
}

export interface Apply4 {
  process_id: string
  arguments: Arguments32
}

export interface Arguments32 {
  data: Data13
  process: Process6
}

export interface Data13 {
  from_node: string
}

export interface Process6 {
  process_graph: ProcessGraph10
}

export interface ProcessGraph10 {
  subtract2: Subtract2
  multiply3: Multiply3
  subtract3: Subtract3
  multiply4: Multiply4
  multiply5: Multiply5
  multiply6: Multiply6
  exp1: Exp1
  multiply7: Multiply7
}

export interface Subtract2 {
  process_id: string
  arguments: Arguments33
}

export interface Arguments33 {
  x: X11
  y: number
}

export interface X11 {
  from_parameter: string
}

export interface Multiply3 {
  process_id: string
  arguments: Arguments34
}

export interface Arguments34 {
  x: X12
  y: number
}

export interface X12 {
  from_node: string
}

export interface Subtract3 {
  process_id: string
  arguments: Arguments35
}

export interface Arguments35 {
  x: X13
  y: number
}

export interface X13 {
  from_parameter: string
}

export interface Multiply4 {
  process_id: string
  arguments: Arguments36
}

export interface Arguments36 {
  x: X14
  y: number
}

export interface X14 {
  from_node: string
}

export interface Multiply5 {
  process_id: string
  arguments: Arguments37
}

export interface Arguments37 {
  x: X15
  y: Y8
}

export interface X15 {
  from_node: string
}

export interface Y8 {
  from_node: string
}

export interface Multiply6 {
  process_id: string
  arguments: Arguments38
}

export interface Arguments38 {
  x: X16
  y: number
}

export interface X16 {
  from_node: string
}

export interface Exp1 {
  process_id: string
  arguments: Arguments39
}

export interface Arguments39 {
  p: P
}

export interface P {
  from_node: string
}

export interface Multiply7 {
  process_id: string
  arguments: Arguments40
  result: boolean
}

export interface Arguments40 {
  x: X17
  y: number
}

export interface X17 {
  from_node: string
}

export interface Renamelabels1 {
  process_id: string
  arguments: Arguments41
}

export interface Arguments41 {
  data: Data14
  dimension: string
  target: string[]
}

export interface Data14 {
  from_node: string
}

export interface Apply5 {
  process_id: string
  arguments: Arguments42
}

export interface Arguments42 {
  data: Data15
  process: Process7
}

export interface Data15 {
  from_node: string
}

export interface Process7 {
  process_graph: ProcessGraph11
}

export interface ProcessGraph11 {
  multiply8: Multiply8
}

export interface Multiply8 {
  process_id: string
  arguments: Arguments43
  result: boolean
}

export interface Arguments43 {
  x: number
  y: Y9
}

export interface Y9 {
  from_parameter: string
}

export interface Mergecubes1 {
  process_id: string
  arguments: Arguments44
}

export interface Arguments44 {
  cube1: Cube1
  cube2: Cube2
  overlap_resolver: OverlapResolver
}

export interface Cube1 {
  from_node: string
}

export interface Cube2 {
  from_node: string
}

export interface OverlapResolver {
  process_graph: ProcessGraph12
}

export interface ProcessGraph12 {
  add2: Add2
}

export interface Add2 {
  process_id: string
  arguments: Arguments45
  result: boolean
}

export interface Arguments45 {
  x: X18
  y: Y10
}

export interface X18 {
  from_parameter: string
}

export interface Y10 {
  from_parameter: string
}

export interface Apply6 {
  process_id: string
  arguments: Arguments46
}

export interface Arguments46 {
  data: Data16
  process: Process8
}

export interface Data16 {
  from_node: string
}

export interface Process8 {
  process_graph: ProcessGraph13
}

export interface ProcessGraph13 {
  subtract4: Subtract4
}

export interface Subtract4 {
  process_id: string
  arguments: Arguments47
  result: boolean
}

export interface Arguments47 {
  x: number
  y: Y11
}

export interface Y11 {
  from_parameter: string
}

export interface Aggregatespatial1 {
  process_id: string
  arguments: Arguments48
}

export interface Arguments48 {
  data: Data17
  geometries: Geometries3
  reducer: Reducer2
}

export interface Data17 {
  from_node: string
}

export interface Geometries3 {
  from_parameter: string
}

export interface Reducer2 {
  process_graph: ProcessGraph14
}

export interface ProcessGraph14 {
  mean1: Mean1
}

export interface Mean1 {
  process_id: string
  arguments: Arguments49
  result: boolean
}

export interface Arguments49 {
  data: Data18
}

export interface Data18 {
  from_parameter: string
}

export interface Vectortoraster1 {
  process_id: string
  arguments: Arguments50
}

export interface Arguments50 {
  data: Data19
  target: Target
}

export interface Data19 {
  from_node: string
}

export interface Target {
  from_node: string
}

export interface Renamelabels2 {
  process_id: string
  arguments: Arguments51
}

export interface Arguments51 {
  data: Data20
  dimension: string
  target: string[]
}

export interface Data20 {
  from_node: string
}

export interface Apply7 {
  process_id: string
  arguments: Arguments52
}

export interface Arguments52 {
  data: Data21
  process: Process9
}

export interface Data21 {
  from_node: string
}

export interface Process9 {
  process_graph: ProcessGraph15
}

export interface ProcessGraph15 {
  multiply9: Multiply9
}

export interface Multiply9 {
  process_id: string
  arguments: Arguments53
  result: boolean
}

export interface Arguments53 {
  x: number
  y: Y12
}

export interface Y12 {
  from_parameter: string
}

export interface Mergecubes2 {
  process_id: string
  arguments: Arguments54
}

export interface Arguments54 {
  cube1: Cube12
  cube2: Cube22
  overlap_resolver: OverlapResolver2
}

export interface Cube12 {
  from_node: string
}

export interface Cube22 {
  from_node: string
}

export interface OverlapResolver2 {
  process_graph: ProcessGraph16
}

export interface ProcessGraph16 {
  add3: Add3
}

export interface Add3 {
  process_id: string
  arguments: Arguments55
  result: boolean
}

export interface Arguments55 {
  x: X19
  y: Y13
}

export interface X19 {
  from_parameter: string
}

export interface Y13 {
  from_parameter: string
}

export interface Apply8 {
  process_id: string
  arguments: Arguments56
}

export interface Arguments56 {
  data: Data22
  process: Process10
}

export interface Data22 {
  from_node: string
}

export interface Process10 {
  process_graph: ProcessGraph17
}

export interface ProcessGraph17 {
  divide1: Divide1
}

export interface Divide1 {
  process_id: string
  arguments: Arguments57
  result: boolean
}

export interface Arguments57 {
  x: X20
  y: number
}

export interface X20 {
  from_parameter: string
}

export interface Reducedimension2 {
  process_id: string
  arguments: Arguments58
}

export interface Arguments58 {
  data: Data23
  dimension: string
  reducer: Reducer3
}

export interface Data23 {
  from_node: string
}

export interface Reducer3 {
  process_graph: ProcessGraph18
}

export interface ProcessGraph18 {
  arrayelement2: Arrayelement2
  eq5: Eq5
}

export interface Arrayelement2 {
  process_id: string
  arguments: Arguments59
}

export interface Arguments59 {
  data: Data24
  index: number
}

export interface Data24 {
  from_parameter: string
}

export interface Eq5 {
  process_id: string
  arguments: Arguments60
  result: boolean
}

export interface Arguments60 {
  x: X21
  y: number
}

export interface X21 {
  from_node: string
}

export interface Mask1 {
  process_id: string
  arguments: Arguments61
}

export interface Arguments61 {
  data: Data25
  mask: Mask
}

export interface Data25 {
  from_node: string
}

export interface Mask {
  from_node: string
}

export interface Applyneighborhood2 {
  process_id: string
  arguments: Arguments62
}

export interface Arguments62 {
  data: Data26
  overlap: any[]
  process: Process11
  size: Size2[]
}

export interface Data26 {
  from_node: string
}

export interface Process11 {
  process_graph: ProcessGraph19
}

export interface ProcessGraph19 {
  arrayapply2: Arrayapply2
}

export interface Arrayapply2 {
  process_id: string
  arguments: Arguments63
  result: boolean
}

export interface Arguments63 {
  data: Data27
  process: Process12
}

export interface Data27 {
  from_parameter: string
}

export interface Process12 {
  process_graph: ProcessGraph20
}

export interface ProcessGraph20 {
  max1: Max1
  neq1: Neq1
}

export interface Max1 {
  process_id: string
  arguments: Arguments64
}

export interface Arguments64 {
  data: Data28
}

export interface Data28 {
  from_parameter: string
}

export interface Neq1 {
  process_id: string
  arguments: Arguments65
  result: boolean
}

export interface Arguments65 {
  x: X22
  y: Y14
}

export interface X22 {
  from_parameter: string
}

export interface Y14 {
  from_node: string
}

export interface Size2 {
  dimension: string
  unit?: string
  value: any
}

export interface Reducedimension3 {
  process_id: string
  arguments: Arguments66
}

export interface Arguments66 {
  data: Data29
  dimension: string
  reducer: Reducer4
}

export interface Data29 {
  from_node: string
}

export interface Reducer4 {
  process_graph: ProcessGraph21
}

export interface ProcessGraph21 {
  arrayelement3: Arrayelement3
}

export interface Arrayelement3 {
  process_id: string
  arguments: Arguments67
  result: boolean
}

export interface Arguments67 {
  data: Data30
  index: number
}

export interface Data30 {
  from_parameter: string
}

export interface Mask2 {
  process_id: string
  arguments: Arguments68
}

export interface Arguments68 {
  data: Data31
  mask: Mask3
}

export interface Data31 {
  from_node: string
}

export interface Mask3 {
  from_node: string
}

export interface Mask32 {
  process_id: string
  arguments: Arguments69
}

export interface Arguments69 {
  data: Data32
  mask: Mask4
}

export interface Data32 {
  from_node: string
}

export interface Mask4 {
  from_node: string
}

export interface Aggregatetemporalperiod1 {
  process_id: string
  arguments: Arguments70
  result: boolean
}

export interface Arguments70 {
  data: Data33
  period: string
  reducer: Reducer5
}

export interface Data33 {
  from_node: string
}

export interface Reducer5 {
  process_graph: ProcessGraph22
}

export interface ProcessGraph22 {
  first1: First1
}

export interface First1 {
  process_id: string
  arguments: Arguments71
  result: boolean
}

export interface Arguments71 {
  data: Data34
}

export interface Data34 {
  from_parameter: string
}

export interface Parameter {
  name: string
  description: string
  schema: Schema
  optional?: boolean
  default?: string[]
}

export interface Schema {
  type: string
  subtype?: string
  uniqueItems?: boolean
  minItems?: number
  maxItems?: number
  items?: Items
}

export interface Items {
  type?: string
  enum?: string[]
  anyOf?: AnyOf[]
}

export interface AnyOf {
  type: string
  subtype?: string
  format?: string
}