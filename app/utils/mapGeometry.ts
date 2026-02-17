/**
 * Route geometry for the Living Service Map.
 *
 * 21 animated routes selected from Map.svg for visual coverage.
 * Full static map rendered as background image.
 *
 * ViewBox: 1657 x 1080 (matches Map.svg)
 * All routes: #00A8E2 at 38% opacity
 * All routes: 2.5px stroke (all have vans)
 */

// --- Types ---

export interface RouteDef {
  id: string;
  d: string;
  strokeColor: string;
  baseOpacity: number;
  strokeWidth: number;
  category: 'highway' | 'arterial' | 'local' | 'connector';
  stopNodes: number[];
  speedMultiplier: number;
}

export interface IndicatorDef {
  id: string;
  routeId: string;
  baseSpeed: number;
  size: number;
  opacity: number;
  startOffset: number;
}

// --- 21 Animated Routes (exact path data from Map.svg, unified #00A8E2) ---

export const animatedRoutes: RouteDef[] = [
  // === HIGHWAYS (3) — all have vans → 3px ===
  {
    id: 'highway-1',
    d: 'M545.603 -11.7812L668.608 232.018L722.349 336.482C727.514 346.533 732.031 356.852 735.876 367.385L748.141 401.103L761.195 442.322C765.014 454.458 767.941 466.812 769.956 479.303L774.425 505.775C776.251 517.004 777.346 528.322 777.701 539.669L782.958 711.537L787.584 785.227C788.355 797.725 790.23 810.146 793.191 822.368V822.368C796.501 836.085 800.959 849.55 806.525 862.644L826.991 910.998L844.513 956.568L846.809 963.398C854.384 985.983 857.632 1009.59 856.411 1033.18L853.923 1080.75',
    strokeColor: '#00A8E2',
    baseOpacity: 0.38,
    strokeWidth: 2.5,
    category: 'highway',
    stopNodes: [0.28, 0.55, 0.78],
    speedMultiplier: 1.4,
  },
  {
    id: 'highway-2',
    d: 'M-100 627L330.677 627.258L750.578 613.678L757.044 793.528V824.478C757.042 828.59 756.537 832.689 755.537 836.699L755.309 837.61C754.309 841.62 753.803 845.719 753.802 849.831V897.816C753.799 902.488 752.139 907.033 749.072 910.772C745.869 914.697 741.305 917.516 736.123 918.77L716.988 923.345L464.424 950.361L325.543 958.022L130.451 963.333L-100 968',
    strokeColor: '#00A8E2',
    baseOpacity: 0.38,
    strokeWidth: 2.5,
    category: 'highway',
    stopNodes: [0.18, 0.42, 0.68],
    speedMultiplier: 1.4,
  },
  {
    id: 'highway-3',
    d: 'M792.128 613.663L1017.81 606.353L1198.05 600.547L1397.41 594.757L1511.76 589.798L1530.56 566.477L1538.91 558.736C1556.11 542.788 1577.17 530.736 1600.39 523.546C1606.74 521.566 1613.23 519.963 1619.81 518.748L1750 514',
    strokeColor: '#00A8E2',
    baseOpacity: 0.38,
    strokeWidth: 2.5,
    category: 'highway',
    stopNodes: [0.22, 0.5, 0.75],
    speedMultiplier: 1.4,
  },

  // === ARTERIALS (8) ===
  {
    id: 'arterial-1',
    d: 'M627.362 -11.7812L626.276 -10.7895C619.796 -4.86146 614.716 2.2152 611.347 10.0042L610.366 12.2755C608.684 16.1389 607.433 20.1473 606.633 24.2399L604.461 35.1966C603.781 38.7136 603.441 42.2782 603.444 45.8494C603.441 51.9204 604.427 57.958 606.371 63.7641L612.293 81.4388C614.362 87.5786 616.879 93.5849 619.828 99.4174L678.737 216.79L740.24 327.157C753.664 353.429 762.645 381.409 766.874 410.14L767.014 411.052L769.905 442.754L768.573 471.018',
    strokeColor: '#00A8E2',
    baseOpacity: 0.38,
    strokeWidth: 2.5,
    category: 'arterial',
    stopNodes: [0.25, 0.58, 0.82],
    speedMultiplier: 1.0,
  },
  {
    id: 'arterial-2',
    d: 'M1311.6 1090L1300.62 791.546L1278.84 177.17L1275.31 70.0662V-12',
    strokeColor: '#00A8E2',
    baseOpacity: 0.38,
    strokeWidth: 2.5,
    category: 'arterial',
    stopNodes: [0.3, 0.65],
    speedMultiplier: 1.0,
  },
  {
    id: 'arterial-3',
    d: 'M1064.1 1090L1059.6 910.151V859.479L1067.26 837.277C1067.26 837.277 1078.1 818.691 1078.1 817.971C1078.1 817.251 1083.66 804.215 1083.66 804.215L1081.8 735.132L1076.54 602.692C1076.54 602.692 1074.44 522.332 1074.44 521.612C1074.44 520.892 1072.32 499.891 1071.65 499.219C1070.99 498.547 1059.63 474.362 1059.63 474.362C1059.63 474.362 1048.26 444.195 1048.26 443.46C1048.26 442.724 1045.88 415.948 1045.88 415.948L1043.23 335.828L1040.76 284.867L1035.51 262.906L1031.53 166.375L1028.2 73.0107L1026 -12',
    strokeColor: '#00A8E2',
    baseOpacity: 0.38,
    strokeWidth: 2.5,
    category: 'arterial',
    stopNodes: [0.2, 0.45, 0.7],
    speedMultiplier: 1.0,
  },
  {
    id: 'arterial-4',
    d: 'M772.286 812.98L766.364 840.172V872.626C766.364 877.937 766.591 883.263 767.047 888.621C768.564 906.329 772.593 923.781 779.032 940.542L782.817 950.395L803.178 1003.4L813.183 1029.25L820.35 1059.64L817.756 1090L745.407 976.931L721.507 943.965L688.565 885.502L651.103 840.108L620.089 808.853L581.33 776.415L561.302 749.879L535.422 706.308C533.318 702.748 530.656 699.488 527.519 696.631C520.718 690.421 511.954 686.315 502.462 684.89L398.135 669.231C394.962 668.78 391.829 668.117 388.761 667.248L374.218 662.977C364.305 660.079 355.294 655.061 347.934 648.341L337.158 638.456L325.541 618.398L310 590L-100 580',
    strokeColor: '#00A8E2',
    baseOpacity: 0.38,
    strokeWidth: 2.5,
    category: 'arterial',
    stopNodes: [0.15, 0.48, 0.75],
    speedMultiplier: 1.0,
  },
  {
    id: 'arterial-5',
    d: 'M750.577 613.664L746.057 549.091C745.39 539.367 743.937 529.701 741.711 520.172L720.79 430.599C720.088 427.549 719.181 424.541 718.074 421.594L707.981 394.658L683.678 336.627C681.804 332.129 679.573 327.761 677.002 323.559L646.899 274.166L600.851 208.777L560.655 147.404L533.495 102.873L505.81 60.7899L481.805 29.9192C476.465 22.9985 470.548 16.4637 464.108 10.3731L445.797 -12',
    strokeColor: '#00A8E2',
    baseOpacity: 0.38,
    strokeWidth: 2.5,
    category: 'arterial',
    stopNodes: [0.22, 0.52, 0.8],
    speedMultiplier: 1.0,
  },
  {
    id: 'arterial-6',
    d: 'M1621.01 1090L1623.58 1051.79L1633.92 1008.74V969.235L1623.58 924.449L1613.89 892.026L1608.73 840.73L1603.47 785.307L1583.46 726.924L1569.25 673.26L1560.19 636.103L1536.94 579.496L1516.93 539.396L1495.6 489.283C1495.6 489.283 1484.62 440.93 1485.26 439.154C1485.91 437.379 1482.04 381.956 1482.04 379.604V296.429C1482.04 294.654 1485.91 218.053 1485.91 218.053L1496.25 151.433C1496.25 151.433 1504.64 107.782 1504 104.839C1503.35 101.896 1494.95 68.2738 1494.95 68.2738L1491.73 -12',
    strokeColor: '#00A8E2',
    baseOpacity: 0.38,
    strokeWidth: 2.5,
    category: 'arterial',
    stopNodes: [0.18, 0.42, 0.68, 0.88],
    speedMultiplier: 1.0,
  },
  {
    id: 'arterial-7',
    d: 'M1495.04 68.2264L1489.79 115.396L1479.45 167.876L1469.11 210.344L1465.24 245.133V424.983L1474.28 468.17L1489.79 517.579L1514.98 600.754L1536.29 659.729L1549.22 722.238L1571.82 789.418L1581.51 856.054L1591.85 928.032L1601.95 987.358C1602.11 988.295 1602.19 989.242 1602.19 990.19V1015.14C1602.19 1017.2 1601.81 1019.23 1601.07 1021.17C1599.7 1024.8 1597.12 1027.94 1593.7 1030.16C1590.28 1032.39 1586.19 1033.58 1581.99 1033.58H1462C1460.77 1033.58 1459.55 1033.68 1458.35 1033.87L1444.18 1036.19C1441.28 1036.67 1438.53 1037.7 1436.12 1039.23C1433.7 1040.75 1431.67 1042.73 1430.16 1045.04V1045.04C1428.23 1047.96 1427.21 1051.3 1427.21 1054.71V1071.93L1425.29 1090L1413.65 822.4L1400.74 427.319L1392.43 186.495C1392.37 184.697 1392.01 182.918 1391.36 181.216L1387.35 170.596C1386.38 168.023 1384.78 165.686 1382.67 163.766V163.766C1380.73 161.992 1378.4 160.61 1375.84 159.709C1373.28 158.808 1370.54 158.408 1367.8 158.535L1318.73 160.791L1261.54 158.983C1250.18 158.638 1238.87 157.569 1227.67 155.784L1214.51 153.689C1190.21 149.806 1166.69 142.619 1144.72 132.367C1126.45 123.842 1107.26 114.772 1106.17 114.245C1104.25 113.061 1035.12 75.8561 1033.18 75.3282C1031.23 74.8004 962.771 41.1145 962.771 41.1145L847.125 -12',
    strokeColor: '#00A8E2',
    baseOpacity: 0.38,
    strokeWidth: 2.5,
    category: 'arterial',
    stopNodes: [0.25, 0.55, 0.78],
    speedMultiplier: 1.0,
  },
  {
    id: 'arterial-8',
    d: 'M1158.01 -12L1169.94 247.069L1180.49 593.381L1187.52 770.368L1198.05 1090',
    strokeColor: '#00A8E2',
    baseOpacity: 0.38,
    strokeWidth: 2.5,
    category: 'arterial',
    stopNodes: [0.3, 0.6],
    speedMultiplier: 1.0,
  },

  // === LOCAL ROADS (6) ===
  {
    id: 'local-1',
    d: 'M505.811 -12L646.899 247.869L696.224 329.348C702.801 340.193 708.881 351.272 714.465 362.586C723.438 380.771 731.099 399.472 737.401 418.569L739.013 423.464C745.115 442.009 749.92 460.89 753.399 479.991L754.152 484.086C756.897 499.217 758.819 514.434 759.917 529.736L761.179 547.731L772.761 825.135L778.561 851.048C779.524 855.35 780.628 859.621 781.907 863.844L792.298 898.441L809.662 948.026L820.509 985.007L823.277 996.588C829.604 1023.06 831.476 1050.25 828.832 1077.24L828.481 1090',
    strokeColor: '#00A8E2',
    baseOpacity: 0.38,
    strokeWidth: 2.5,
    category: 'local',
    stopNodes: [0.28, 0.58, 0.85],
    speedMultiplier: 0.7,
  },
  {
    id: 'local-2',
    d: 'M668.608 231.586L728.657 325.382L734.527 334.563C740.709 344.247 748.229 353.165 756.903 361.099L762.405 366.122C767.379 370.623 771.521 375.83 774.67 381.541V381.541C779.163 389.8 781.479 398.904 781.434 408.125V420.537L788.67 538.758L799.517 776.542L802.285 803.158C803.331 813.124 805.498 822.965 808.751 832.525L814.007 847.865L844.952 927.329C847.484 933.778 849.407 940.414 850.699 947.163L853.485 961.735C855.539 972.531 856.547 983.471 856.499 994.429L856.323 1090',
    strokeColor: '#00A8E2',
    baseOpacity: 0.38,
    strokeWidth: 2.5,
    category: 'local',
    stopNodes: [0.22, 0.5, 0.75],
    speedMultiplier: 0.7,
  },
  {
    id: 'local-3',
    d: 'M737.405 418.554L320.5 429.222C314.072 429.39 307.695 428.122 301.926 425.526C296.157 422.931 291.171 419.087 287.401 414.331L243.893 359.499L98.4594 232.018C98.4594 232.018 38.6738 178.402 35.5198 174.595C33.3211 171.708 31.5533 168.567 30.2631 165.254C26.9629 157.132 25.3065 148.531 25.3745 139.869V115.109L20.3105 -12',
    strokeColor: '#00A8E2',
    baseOpacity: 0.38,
    strokeWidth: 2.5,
    category: 'local',
    stopNodes: [0.25, 0.6, 0.82],
    speedMultiplier: 0.7,
  },
  {
    id: 'local-4',
    d: 'M898.729 -12L905.283 176.723L894.314 192.638L890.424 205.578V226.26L909.803 766.386L923.366 1090',
    strokeColor: '#00A8E2',
    baseOpacity: 0.38,
    strokeWidth: 2.5,
    category: 'local',
    stopNodes: [0.35, 0.7],
    speedMultiplier: 0.7,
  },
  {
    id: 'local-5',
    d: 'M1750 969L1443.93 977.524L1408.8 981.619L863.631 994.191L793.385 998.046H749.825L683.083 1012.15L434.391 1019.85L74.6953 1033.19L-100 1036',
    strokeColor: '#00A8E2',
    baseOpacity: 0.38,
    strokeWidth: 2.5,
    category: 'local',
    stopNodes: [0.18, 0.52, 0.8],
    speedMultiplier: 0.7,
  },

  // === CONNECTORS (3) ===
  {
    id: 'connector-1',
    d: 'M797.961 741.625L1235.37 731.612L1549.31 722.175H1581.04C1586.06 722.172 1591 720.964 1595.34 718.672L1595.62 718.528C1601.97 715.183 1606.66 709.745 1608.75 703.332C1610.01 699.435 1610.27 695.322 1609.48 691.32L1608.36 685.546C1607.77 682.473 1606.58 679.521 1604.86 676.828L1601.58 671.774C1598.65 667.262 1595.01 663.17 1590.77 659.634V659.634C1585.32 655.105 1578.22 652.596 1570.85 652.596H1553.88L1453.76 656.722L1077.81 669.695',
    strokeColor: '#00A8E2',
    baseOpacity: 0.38,
    strokeWidth: 2.5,
    category: 'connector',
    stopNodes: [0.4],
    speedMultiplier: 0.8,
  },
  {
    id: 'connector-2',
    d: 'M-100 260L230.152 247.868L248.235 243.901L271.382 235.904H297.438L603.497 224.707L778.631 217.445L1234.42 205.545L1473.19 198.315L1505.01 200.282L1528.9 202.906L1553.02 207.432C1555.74 207.944 1558.52 208.201 1561.29 208.2C1568.05 208.2 1574.71 206.679 1580.67 203.769L1750 166',
    strokeColor: '#00A8E2',
    baseOpacity: 0.38,
    strokeWidth: 2.5,
    category: 'connector',
    stopNodes: [0.32, 0.68],
    speedMultiplier: 0.8,
  },
  {
    id: 'connector-3',
    d: 'M574.674 880.686L514.415 837.083L492.705 822.4L474.429 797.607L453.929 764.417C450.753 759.266 446.821 754.536 442.241 750.357C435.905 744.572 428.434 739.928 420.216 736.665L314.732 694.886C311.171 693.474 307.33 692.745 303.448 692.743H234.463L88.7314 584.391C88.7314 584.391 1.69871 513.212 0.927734 511.293L-100 505',
    strokeColor: '#00A8E2',
    baseOpacity: 0.38,
    strokeWidth: 2.5,
    category: 'connector',
    stopNodes: [0.28, 0.62],
    speedMultiplier: 0.8,
  },
  // === NEW ROUTES (1) — right-edge-reaching ===
  {
    id: 'cross-2',
    d: 'M800.445 785.275L817.757 831.901L847.142 912.629L864.909 928.848L886.549 936.798H909.801L1306.43 926.785L1606.8 917.94L1750 917',
    strokeColor: '#00A8E2',
    baseOpacity: 0.38,
    strokeWidth: 2.5,
    category: 'connector',
    stopNodes: [0.3, 0.7],
    speedMultiplier: 0.85,
  },
];

// --- Indicator Definitions ---
// 22 vans total. Slower speeds for realistic feel (45-90s per traversal).
// Some routes have 2 vans for organic density.

export const indicators: IndicatorDef[] = [
  // Highways (fast, 2 vans on highway-1)
  { id: 'van-1',  routeId: 'highway-1',  baseSpeed: 48, size: 3.5, opacity: 1.0, startOffset: 0.1 },
  { id: 'van-2',  routeId: 'highway-2',  baseSpeed: 50, size: 3.2, opacity: 1.0, startOffset: 0.3 },
  { id: 'van-3',  routeId: 'highway-3',  baseSpeed: 50, size: 3.4, opacity: 1.0, startOffset: 0.6 },
  { id: 'van-18', routeId: 'highway-1',  baseSpeed: 52, size: 3.3, opacity: 1.0, startOffset: 0.55 },

  // Arterials (medium)
  { id: 'van-4',  routeId: 'arterial-1', baseSpeed: 60, size: 3.0, opacity: 1.0, startOffset: 0.05 },
  { id: 'van-5',  routeId: 'arterial-2', baseSpeed: 62, size: 2.8, opacity: 1.0, startOffset: 0.4 },
  { id: 'van-6',  routeId: 'arterial-3', baseSpeed: 58, size: 3.1, opacity: 1.0, startOffset: 0.7 },
  { id: 'van-7',  routeId: 'arterial-4', baseSpeed: 60, size: 2.9, opacity: 1.0, startOffset: 0.2 },
  { id: 'van-8',  routeId: 'arterial-6', baseSpeed: 65, size: 3.0, opacity: 1.0, startOffset: 0.55 },
  { id: 'van-13', routeId: 'arterial-5', baseSpeed: 58, size: 3.0, opacity: 1.0, startOffset: 0.35 },
  { id: 'van-14', routeId: 'arterial-7', baseSpeed: 62, size: 2.9, opacity: 1.0, startOffset: 0.15 },
  { id: 'van-15', routeId: 'arterial-8', baseSpeed: 60, size: 3.0, opacity: 1.0, startOffset: 0.45 },

  // Local roads (slow)
  { id: 'van-9',  routeId: 'local-1',    baseSpeed: 80, size: 2.6, opacity: 1.0, startOffset: 0.15 },
  { id: 'van-10', routeId: 'local-5',    baseSpeed: 75, size: 2.7, opacity: 1.0, startOffset: 0.5 },
  { id: 'van-16', routeId: 'local-2',    baseSpeed: 78, size: 2.7, opacity: 1.0, startOffset: 0.3 },
  { id: 'van-17', routeId: 'local-3',    baseSpeed: 82, size: 2.6, opacity: 1.0, startOffset: 0.6 },

  // Connectors (2 vans on connector-1)
  { id: 'van-11', routeId: 'connector-1', baseSpeed: 68, size: 2.8, opacity: 1.0, startOffset: 0.3 },
  { id: 'van-12', routeId: 'connector-2', baseSpeed: 70, size: 2.7, opacity: 1.0, startOffset: 0.65 },

  // New vans
  { id: 'van-22', routeId: 'cross-2',    baseSpeed: 68, size: 2.9, opacity: 1.0, startOffset: 0.4 },
  { id: 'van-23', routeId: 'local-4',    baseSpeed: 78, size: 2.7, opacity: 1.0, startOffset: 0.2 },
  { id: 'van-24', routeId: 'connector-3',baseSpeed: 70, size: 2.8, opacity: 1.0, startOffset: 0.35 },
  { id: 'van-25', routeId: 'arterial-5', baseSpeed: 62, size: 3.0, opacity: 1.0, startOffset: 0.7 },
];

// ViewBox dimensions (from Map.svg)
export const MAP_VIEWBOX = { width: 1657, height: 1080 };
