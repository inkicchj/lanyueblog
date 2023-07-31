!function (e, t) {
    "object" == typeof exports && "object" == typeof module ? module.exports = t() : "function" == typeof define && define.amd ? define([], t) : "object" == typeof exports ? exports.Vditor = t() : e.Vditor = t()
}(this, (function () {
    return (() => {
        var e = {
            14: e => {
                var t = function () {
                    this.Diff_Timeout = 1, this.Diff_EditCost = 4, this.Match_Threshold = .5, this.Match_Distance = 1e3, this.Patch_DeleteThreshold = .5, this.Patch_Margin = 4, this.Match_MaxBits = 32
                }, n = -1;
                t.Diff = function (e, t) {
                    return [e, t]
                }, t.prototype.diff_main = function (e, n, r, i) {
                    void 0 === i && (i = this.Diff_Timeout <= 0 ? Number.MAX_VALUE : (new Date).getTime() + 1e3 * this.Diff_Timeout);
                    var o = i;
                    if (null == e || null == n) throw new Error("Null input. (diff_main)");
                    if (e == n) return e ? [new t.Diff(0, e)] : [];
                    void 0 === r && (r = !0);
                    var a = r, l = this.diff_commonPrefix(e, n), s = e.substring(0, l);
                    e = e.substring(l), n = n.substring(l), l = this.diff_commonSuffix(e, n);
                    var d = e.substring(e.length - l);
                    e = e.substring(0, e.length - l), n = n.substring(0, n.length - l);
                    var c = this.diff_compute_(e, n, a, o);
                    return s && c.unshift(new t.Diff(0, s)), d && c.push(new t.Diff(0, d)), this.diff_cleanupMerge(c), c
                }, t.prototype.diff_compute_ = function (e, r, i, o) {
                    var a;
                    if (!e) return [new t.Diff(1, r)];
                    if (!r) return [new t.Diff(n, e)];
                    var l = e.length > r.length ? e : r, s = e.length > r.length ? r : e, d = l.indexOf(s);
                    if (-1 != d) return a = [new t.Diff(1, l.substring(0, d)), new t.Diff(0, s), new t.Diff(1, l.substring(d + s.length))], e.length > r.length && (a[0][0] = a[2][0] = n), a;
                    if (1 == s.length) return [new t.Diff(n, e), new t.Diff(1, r)];
                    var c = this.diff_halfMatch_(e, r);
                    if (c) {
                        var u = c[0], p = c[1], m = c[2], f = c[3], h = c[4], v = this.diff_main(u, m, i, o),
                            g = this.diff_main(p, f, i, o);
                        return v.concat([new t.Diff(0, h)], g)
                    }
                    return i && e.length > 100 && r.length > 100 ? this.diff_lineMode_(e, r, o) : this.diff_bisect_(e, r, o)
                }, t.prototype.diff_lineMode_ = function (e, r, i) {
                    var o = this.diff_linesToChars_(e, r);
                    e = o.chars1, r = o.chars2;
                    var a = o.lineArray, l = this.diff_main(e, r, !1, i);
                    this.diff_charsToLines_(l, a), this.diff_cleanupSemantic(l), l.push(new t.Diff(0, ""));
                    for (var s = 0, d = 0, c = 0, u = "", p = ""; s < l.length;) {
                        switch (l[s][0]) {
                            case 1:
                                c++, p += l[s][1];
                                break;
                            case n:
                                d++, u += l[s][1];
                                break;
                            case 0:
                                if (d >= 1 && c >= 1) {
                                    l.splice(s - d - c, d + c), s = s - d - c;
                                    for (var m = this.diff_main(u, p, !1, i), f = m.length - 1; f >= 0; f--) l.splice(s, 0, m[f]);
                                    s += m.length
                                }
                                c = 0, d = 0, u = "", p = ""
                        }
                        s++
                    }
                    return l.pop(), l
                }, t.prototype.diff_bisect_ = function (e, r, i) {
                    for (var o = e.length, a = r.length, l = Math.ceil((o + a) / 2), s = l, d = 2 * l, c = new Array(d), u = new Array(d), p = 0; p < d; p++) c[p] = -1, u[p] = -1;
                    c[s + 1] = 0, u[s + 1] = 0;
                    for (var m = o - a, f = m % 2 != 0, h = 0, v = 0, g = 0, y = 0, b = 0; b < l && !((new Date).getTime() > i); b++) {
                        for (var w = -b + h; w <= b - v; w += 2) {
                            for (var E = s + w, k = (M = w == -b || w != b && c[E - 1] < c[E + 1] ? c[E + 1] : c[E - 1] + 1) - w; M < o && k < a && e.charAt(M) == r.charAt(k);) M++, k++;
                            if (c[E] = M, M > o) v += 2; else if (k > a) h += 2; else if (f) {
                                if ((C = s + m - w) >= 0 && C < d && -1 != u[C]) if (M >= (L = o - u[C])) return this.diff_bisectSplit_(e, r, M, k, i)
                            }
                        }
                        for (var S = -b + g; S <= b - y; S += 2) {
                            for (var L, C = s + S, T = (L = S == -b || S != b && u[C - 1] < u[C + 1] ? u[C + 1] : u[C - 1] + 1) - S; L < o && T < a && e.charAt(o - L - 1) == r.charAt(a - T - 1);) L++, T++;
                            if (u[C] = L, L > o) y += 2; else if (T > a) g += 2; else if (!f) {
                                if ((E = s + m - S) >= 0 && E < d && -1 != c[E]) {
                                    var M;
                                    k = s + (M = c[E]) - E;
                                    if (M >= (L = o - L)) return this.diff_bisectSplit_(e, r, M, k, i)
                                }
                            }
                        }
                    }
                    return [new t.Diff(n, e), new t.Diff(1, r)]
                }, t.prototype.diff_bisectSplit_ = function (e, t, n, r, i) {
                    var o = e.substring(0, n), a = t.substring(0, r), l = e.substring(n), s = t.substring(r),
                        d = this.diff_main(o, a, !1, i), c = this.diff_main(l, s, !1, i);
                    return d.concat(c)
                }, t.prototype.diff_linesToChars_ = function (e, t) {
                    var n = [], r = {};

                    function i(e) {
                        for (var t = "", i = 0, a = -1, l = n.length; a < e.length - 1;) {
                            -1 == (a = e.indexOf("\n", i)) && (a = e.length - 1);
                            var s = e.substring(i, a + 1);
                            (r.hasOwnProperty ? r.hasOwnProperty(s) : void 0 !== r[s]) ? t += String.fromCharCode(r[s]) : (l == o && (s = e.substring(i), a = e.length), t += String.fromCharCode(l), r[s] = l, n[l++] = s), i = a + 1
                        }
                        return t
                    }

                    n[0] = "";
                    var o = 4e4, a = i(e);
                    return o = 65535, {chars1: a, chars2: i(t), lineArray: n}
                }, t.prototype.diff_charsToLines_ = function (e, t) {
                    for (var n = 0; n < e.length; n++) {
                        for (var r = e[n][1], i = [], o = 0; o < r.length; o++) i[o] = t[r.charCodeAt(o)];
                        e[n][1] = i.join("")
                    }
                }, t.prototype.diff_commonPrefix = function (e, t) {
                    if (!e || !t || e.charAt(0) != t.charAt(0)) return 0;
                    for (var n = 0, r = Math.min(e.length, t.length), i = r, o = 0; n < i;) e.substring(o, i) == t.substring(o, i) ? o = n = i : r = i, i = Math.floor((r - n) / 2 + n);
                    return i
                }, t.prototype.diff_commonSuffix = function (e, t) {
                    if (!e || !t || e.charAt(e.length - 1) != t.charAt(t.length - 1)) return 0;
                    for (var n = 0, r = Math.min(e.length, t.length), i = r, o = 0; n < i;) e.substring(e.length - i, e.length - o) == t.substring(t.length - i, t.length - o) ? o = n = i : r = i, i = Math.floor((r - n) / 2 + n);
                    return i
                }, t.prototype.diff_commonOverlap_ = function (e, t) {
                    var n = e.length, r = t.length;
                    if (0 == n || 0 == r) return 0;
                    n > r ? e = e.substring(n - r) : n < r && (t = t.substring(0, n));
                    var i = Math.min(n, r);
                    if (e == t) return i;
                    for (var o = 0, a = 1; ;) {
                        var l = e.substring(i - a), s = t.indexOf(l);
                        if (-1 == s) return o;
                        a += s, 0 != s && e.substring(i - a) != t.substring(0, a) || (o = a, a++)
                    }
                }, t.prototype.diff_halfMatch_ = function (e, t) {
                    if (this.Diff_Timeout <= 0) return null;
                    var n = e.length > t.length ? e : t, r = e.length > t.length ? t : e;
                    if (n.length < 4 || 2 * r.length < n.length) return null;
                    var i = this;

                    function o(e, t, n) {
                        for (var r, o, a, l, s = e.substring(n, n + Math.floor(e.length / 4)), d = -1, c = ""; -1 != (d = t.indexOf(s, d + 1));) {
                            var u = i.diff_commonPrefix(e.substring(n), t.substring(d)),
                                p = i.diff_commonSuffix(e.substring(0, n), t.substring(0, d));
                            c.length < p + u && (c = t.substring(d - p, d) + t.substring(d, d + u), r = e.substring(0, n - p), o = e.substring(n + u), a = t.substring(0, d - p), l = t.substring(d + u))
                        }
                        return 2 * c.length >= e.length ? [r, o, a, l, c] : null
                    }

                    var a, l, s, d, c, u = o(n, r, Math.ceil(n.length / 4)), p = o(n, r, Math.ceil(n.length / 2));
                    return u || p ? (a = p ? u && u[4].length > p[4].length ? u : p : u, e.length > t.length ? (l = a[0], s = a[1], d = a[2], c = a[3]) : (d = a[0], c = a[1], l = a[2], s = a[3]), [l, s, d, c, a[4]]) : null
                }, t.prototype.diff_cleanupSemantic = function (e) {
                    for (var r = !1, i = [], o = 0, a = null, l = 0, s = 0, d = 0, c = 0, u = 0; l < e.length;) 0 == e[l][0] ? (i[o++] = l, s = c, d = u, c = 0, u = 0, a = e[l][1]) : (1 == e[l][0] ? c += e[l][1].length : u += e[l][1].length, a && a.length <= Math.max(s, d) && a.length <= Math.max(c, u) && (e.splice(i[o - 1], 0, new t.Diff(n, a)), e[i[o - 1] + 1][0] = 1, o--, l = --o > 0 ? i[o - 1] : -1, s = 0, d = 0, c = 0, u = 0, a = null, r = !0)), l++;
                    for (r && this.diff_cleanupMerge(e), this.diff_cleanupSemanticLossless(e), l = 1; l < e.length;) {
                        if (e[l - 1][0] == n && 1 == e[l][0]) {
                            var p = e[l - 1][1], m = e[l][1], f = this.diff_commonOverlap_(p, m),
                                h = this.diff_commonOverlap_(m, p);
                            f >= h ? (f >= p.length / 2 || f >= m.length / 2) && (e.splice(l, 0, new t.Diff(0, m.substring(0, f))), e[l - 1][1] = p.substring(0, p.length - f), e[l + 1][1] = m.substring(f), l++) : (h >= p.length / 2 || h >= m.length / 2) && (e.splice(l, 0, new t.Diff(0, p.substring(0, h))), e[l - 1][0] = 1, e[l - 1][1] = m.substring(0, m.length - h), e[l + 1][0] = n, e[l + 1][1] = p.substring(h), l++), l++
                        }
                        l++
                    }
                }, t.prototype.diff_cleanupSemanticLossless = function (e) {
                    function n(e, n) {
                        if (!e || !n) return 6;
                        var r = e.charAt(e.length - 1), i = n.charAt(0), o = r.match(t.nonAlphaNumericRegex_),
                            a = i.match(t.nonAlphaNumericRegex_), l = o && r.match(t.whitespaceRegex_),
                            s = a && i.match(t.whitespaceRegex_), d = l && r.match(t.linebreakRegex_),
                            c = s && i.match(t.linebreakRegex_), u = d && e.match(t.blanklineEndRegex_),
                            p = c && n.match(t.blanklineStartRegex_);
                        return u || p ? 5 : d || c ? 4 : o && !l && s ? 3 : l || s ? 2 : o || a ? 1 : 0
                    }

                    for (var r = 1; r < e.length - 1;) {
                        if (0 == e[r - 1][0] && 0 == e[r + 1][0]) {
                            var i = e[r - 1][1], o = e[r][1], a = e[r + 1][1], l = this.diff_commonSuffix(i, o);
                            if (l) {
                                var s = o.substring(o.length - l);
                                i = i.substring(0, i.length - l), o = s + o.substring(0, o.length - l), a = s + a
                            }
                            for (var d = i, c = o, u = a, p = n(i, o) + n(o, a); o.charAt(0) === a.charAt(0);) {
                                i += o.charAt(0), o = o.substring(1) + a.charAt(0), a = a.substring(1);
                                var m = n(i, o) + n(o, a);
                                m >= p && (p = m, d = i, c = o, u = a)
                            }
                            e[r - 1][1] != d && (d ? e[r - 1][1] = d : (e.splice(r - 1, 1), r--), e[r][1] = c, u ? e[r + 1][1] = u : (e.splice(r + 1, 1), r--))
                        }
                        r++
                    }
                }, t.nonAlphaNumericRegex_ = /[^a-zA-Z0-9]/, t.whitespaceRegex_ = /\s/, t.linebreakRegex_ = /[\r\n]/, t.blanklineEndRegex_ = /\n\r?\n$/, t.blanklineStartRegex_ = /^\r?\n\r?\n/, t.prototype.diff_cleanupEfficiency = function (e) {
                    for (var r = !1, i = [], o = 0, a = null, l = 0, s = !1, d = !1, c = !1, u = !1; l < e.length;) 0 == e[l][0] ? (e[l][1].length < this.Diff_EditCost && (c || u) ? (i[o++] = l, s = c, d = u, a = e[l][1]) : (o = 0, a = null), c = u = !1) : (e[l][0] == n ? u = !0 : c = !0, a && (s && d && c && u || a.length < this.Diff_EditCost / 2 && s + d + c + u == 3) && (e.splice(i[o - 1], 0, new t.Diff(n, a)), e[i[o - 1] + 1][0] = 1, o--, a = null, s && d ? (c = u = !0, o = 0) : (l = --o > 0 ? i[o - 1] : -1, c = u = !1), r = !0)), l++;
                    r && this.diff_cleanupMerge(e)
                }, t.prototype.diff_cleanupMerge = function (e) {
                    e.push(new t.Diff(0, ""));
                    for (var r, i = 0, o = 0, a = 0, l = "", s = ""; i < e.length;) switch (e[i][0]) {
                        case 1:
                            a++, s += e[i][1], i++;
                            break;
                        case n:
                            o++, l += e[i][1], i++;
                            break;
                        case 0:
                            o + a > 1 ? (0 !== o && 0 !== a && (0 !== (r = this.diff_commonPrefix(s, l)) && (i - o - a > 0 && 0 == e[i - o - a - 1][0] ? e[i - o - a - 1][1] += s.substring(0, r) : (e.splice(0, 0, new t.Diff(0, s.substring(0, r))), i++), s = s.substring(r), l = l.substring(r)), 0 !== (r = this.diff_commonSuffix(s, l)) && (e[i][1] = s.substring(s.length - r) + e[i][1], s = s.substring(0, s.length - r), l = l.substring(0, l.length - r))), i -= o + a, e.splice(i, o + a), l.length && (e.splice(i, 0, new t.Diff(n, l)), i++), s.length && (e.splice(i, 0, new t.Diff(1, s)), i++), i++) : 0 !== i && 0 == e[i - 1][0] ? (e[i - 1][1] += e[i][1], e.splice(i, 1)) : i++, a = 0, o = 0, l = "", s = ""
                    }
                    "" === e[e.length - 1][1] && e.pop();
                    var d = !1;
                    for (i = 1; i < e.length - 1;) 0 == e[i - 1][0] && 0 == e[i + 1][0] && (e[i][1].substring(e[i][1].length - e[i - 1][1].length) == e[i - 1][1] ? (e[i][1] = e[i - 1][1] + e[i][1].substring(0, e[i][1].length - e[i - 1][1].length), e[i + 1][1] = e[i - 1][1] + e[i + 1][1], e.splice(i - 1, 1), d = !0) : e[i][1].substring(0, e[i + 1][1].length) == e[i + 1][1] && (e[i - 1][1] += e[i + 1][1], e[i][1] = e[i][1].substring(e[i + 1][1].length) + e[i + 1][1], e.splice(i + 1, 1), d = !0)), i++;
                    d && this.diff_cleanupMerge(e)
                }, t.prototype.diff_xIndex = function (e, t) {
                    var r, i = 0, o = 0, a = 0, l = 0;
                    for (r = 0; r < e.length && (1 !== e[r][0] && (i += e[r][1].length), e[r][0] !== n && (o += e[r][1].length), !(i > t)); r++) a = i, l = o;
                    return e.length != r && e[r][0] === n ? l : l + (t - a)
                }, t.prototype.diff_prettyHtml = function (e) {
                    for (var t = [], r = /&/g, i = /</g, o = />/g, a = /\n/g, l = 0; l < e.length; l++) {
                        var s = e[l][0],
                            d = e[l][1].replace(r, "&amp;").replace(i, "&lt;").replace(o, "&gt;").replace(a, "&para;<br>");
                        switch (s) {
                            case 1:
                                t[l] = '<ins style="background:#e6ffe6;">' + d + "</ins>";
                                break;
                            case n:
                                t[l] = '<del style="background:#ffe6e6;">' + d + "</del>";
                                break;
                            case 0:
                                t[l] = "<span>" + d + "</span>"
                        }
                    }
                    return t.join("")
                }, t.prototype.diff_text1 = function (e) {
                    for (var t = [], n = 0; n < e.length; n++) 1 !== e[n][0] && (t[n] = e[n][1]);
                    return t.join("")
                }, t.prototype.diff_text2 = function (e) {
                    for (var t = [], r = 0; r < e.length; r++) e[r][0] !== n && (t[r] = e[r][1]);
                    return t.join("")
                }, t.prototype.diff_levenshtein = function (e) {
                    for (var t = 0, r = 0, i = 0, o = 0; o < e.length; o++) {
                        var a = e[o][0], l = e[o][1];
                        switch (a) {
                            case 1:
                                r += l.length;
                                break;
                            case n:
                                i += l.length;
                                break;
                            case 0:
                                t += Math.max(r, i), r = 0, i = 0
                        }
                    }
                    return t += Math.max(r, i)
                }, t.prototype.diff_toDelta = function (e) {
                    for (var t = [], r = 0; r < e.length; r++) switch (e[r][0]) {
                        case 1:
                            t[r] = "+" + encodeURI(e[r][1]);
                            break;
                        case n:
                            t[r] = "-" + e[r][1].length;
                            break;
                        case 0:
                            t[r] = "=" + e[r][1].length
                    }
                    return t.join("\t").replace(/%20/g, " ")
                }, t.prototype.diff_fromDelta = function (e, r) {
                    for (var i = [], o = 0, a = 0, l = r.split(/\t/g), s = 0; s < l.length; s++) {
                        var d = l[s].substring(1);
                        switch (l[s].charAt(0)) {
                            case"+":
                                try {
                                    i[o++] = new t.Diff(1, decodeURI(d))
                                } catch (e) {
                                    throw new Error("Illegal escape in diff_fromDelta: " + d)
                                }
                                break;
                            case"-":
                            case"=":
                                var c = parseInt(d, 10);
                                if (isNaN(c) || c < 0) throw new Error("Invalid number in diff_fromDelta: " + d);
                                var u = e.substring(a, a += c);
                                "=" == l[s].charAt(0) ? i[o++] = new t.Diff(0, u) : i[o++] = new t.Diff(n, u);
                                break;
                            default:
                                if (l[s]) throw new Error("Invalid diff operation in diff_fromDelta: " + l[s])
                        }
                    }
                    if (a != e.length) throw new Error("Delta length (" + a + ") does not equal source text length (" + e.length + ").");
                    return i
                }, t.prototype.match_main = function (e, t, n) {
                    if (null == e || null == t || null == n) throw new Error("Null input. (match_main)");
                    return n = Math.max(0, Math.min(n, e.length)), e == t ? 0 : e.length ? e.substring(n, n + t.length) == t ? n : this.match_bitap_(e, t, n) : -1
                }, t.prototype.match_bitap_ = function (e, t, n) {
                    if (t.length > this.Match_MaxBits) throw new Error("Pattern too long for this browser.");
                    var r = this.match_alphabet_(t), i = this;

                    function o(e, r) {
                        var o = e / t.length, a = Math.abs(n - r);
                        return i.Match_Distance ? o + a / i.Match_Distance : a ? 1 : o
                    }

                    var a = this.Match_Threshold, l = e.indexOf(t, n);
                    -1 != l && (a = Math.min(o(0, l), a), -1 != (l = e.lastIndexOf(t, n + t.length)) && (a = Math.min(o(0, l), a)));
                    var s, d, c = 1 << t.length - 1;
                    l = -1;
                    for (var u, p = t.length + e.length, m = 0; m < t.length; m++) {
                        for (s = 0, d = p; s < d;) o(m, n + d) <= a ? s = d : p = d, d = Math.floor((p - s) / 2 + s);
                        p = d;
                        var f = Math.max(1, n - d + 1), h = Math.min(n + d, e.length) + t.length, v = Array(h + 2);
                        v[h + 1] = (1 << m) - 1;
                        for (var g = h; g >= f; g--) {
                            var y = r[e.charAt(g - 1)];
                            if (v[g] = 0 === m ? (v[g + 1] << 1 | 1) & y : (v[g + 1] << 1 | 1) & y | (u[g + 1] | u[g]) << 1 | 1 | u[g + 1], v[g] & c) {
                                var b = o(m, g - 1);
                                if (b <= a) {
                                    if (a = b, !((l = g - 1) > n)) break;
                                    f = Math.max(1, 2 * n - l)
                                }
                            }
                        }
                        if (o(m + 1, n) > a) break;
                        u = v
                    }
                    return l
                }, t.prototype.match_alphabet_ = function (e) {
                    for (var t = {}, n = 0; n < e.length; n++) t[e.charAt(n)] = 0;
                    for (n = 0; n < e.length; n++) t[e.charAt(n)] |= 1 << e.length - n - 1;
                    return t
                }, t.prototype.patch_addContext_ = function (e, n) {
                    if (0 != n.length) {
                        if (null === e.start2) throw Error("patch not initialized");
                        for (var r = n.substring(e.start2, e.start2 + e.length1), i = 0; n.indexOf(r) != n.lastIndexOf(r) && r.length < this.Match_MaxBits - this.Patch_Margin - this.Patch_Margin;) i += this.Patch_Margin, r = n.substring(e.start2 - i, e.start2 + e.length1 + i);
                        i += this.Patch_Margin;
                        var o = n.substring(e.start2 - i, e.start2);
                        o && e.diffs.unshift(new t.Diff(0, o));
                        var a = n.substring(e.start2 + e.length1, e.start2 + e.length1 + i);
                        a && e.diffs.push(new t.Diff(0, a)), e.start1 -= o.length, e.start2 -= o.length, e.length1 += o.length + a.length, e.length2 += o.length + a.length
                    }
                }, t.prototype.patch_make = function (e, r, i) {
                    var o, a;
                    if ("string" == typeof e && "string" == typeof r && void 0 === i) o = e, (a = this.diff_main(o, r, !0)).length > 2 && (this.diff_cleanupSemantic(a), this.diff_cleanupEfficiency(a)); else if (e && "object" == typeof e && void 0 === r && void 0 === i) a = e, o = this.diff_text1(a); else if ("string" == typeof e && r && "object" == typeof r && void 0 === i) o = e, a = r; else {
                        if ("string" != typeof e || "string" != typeof r || !i || "object" != typeof i) throw new Error("Unknown call format to patch_make.");
                        o = e, a = i
                    }
                    if (0 === a.length) return [];
                    for (var l = [], s = new t.patch_obj, d = 0, c = 0, u = 0, p = o, m = o, f = 0; f < a.length; f++) {
                        var h = a[f][0], v = a[f][1];
                        switch (d || 0 === h || (s.start1 = c, s.start2 = u), h) {
                            case 1:
                                s.diffs[d++] = a[f], s.length2 += v.length, m = m.substring(0, u) + v + m.substring(u);
                                break;
                            case n:
                                s.length1 += v.length, s.diffs[d++] = a[f], m = m.substring(0, u) + m.substring(u + v.length);
                                break;
                            case 0:
                                v.length <= 2 * this.Patch_Margin && d && a.length != f + 1 ? (s.diffs[d++] = a[f], s.length1 += v.length, s.length2 += v.length) : v.length >= 2 * this.Patch_Margin && d && (this.patch_addContext_(s, p), l.push(s), s = new t.patch_obj, d = 0, p = m, c = u)
                        }
                        1 !== h && (c += v.length), h !== n && (u += v.length)
                    }
                    return d && (this.patch_addContext_(s, p), l.push(s)), l
                }, t.prototype.patch_deepCopy = function (e) {
                    for (var n = [], r = 0; r < e.length; r++) {
                        var i = e[r], o = new t.patch_obj;
                        o.diffs = [];
                        for (var a = 0; a < i.diffs.length; a++) o.diffs[a] = new t.Diff(i.diffs[a][0], i.diffs[a][1]);
                        o.start1 = i.start1, o.start2 = i.start2, o.length1 = i.length1, o.length2 = i.length2, n[r] = o
                    }
                    return n
                }, t.prototype.patch_apply = function (e, t) {
                    if (0 == e.length) return [t, []];
                    e = this.patch_deepCopy(e);
                    var r = this.patch_addPadding(e);
                    t = r + t + r, this.patch_splitMax(e);
                    for (var i = 0, o = [], a = 0; a < e.length; a++) {
                        var l, s, d = e[a].start2 + i, c = this.diff_text1(e[a].diffs), u = -1;
                        if (c.length > this.Match_MaxBits ? -1 != (l = this.match_main(t, c.substring(0, this.Match_MaxBits), d)) && (-1 == (u = this.match_main(t, c.substring(c.length - this.Match_MaxBits), d + c.length - this.Match_MaxBits)) || l >= u) && (l = -1) : l = this.match_main(t, c, d), -1 == l) o[a] = !1, i -= e[a].length2 - e[a].length1; else if (o[a] = !0, i = l - d, c == (s = -1 == u ? t.substring(l, l + c.length) : t.substring(l, u + this.Match_MaxBits))) t = t.substring(0, l) + this.diff_text2(e[a].diffs) + t.substring(l + c.length); else {
                            var p = this.diff_main(c, s, !1);
                            if (c.length > this.Match_MaxBits && this.diff_levenshtein(p) / c.length > this.Patch_DeleteThreshold) o[a] = !1; else {
                                this.diff_cleanupSemanticLossless(p);
                                for (var m, f = 0, h = 0; h < e[a].diffs.length; h++) {
                                    var v = e[a].diffs[h];
                                    0 !== v[0] && (m = this.diff_xIndex(p, f)), 1 === v[0] ? t = t.substring(0, l + m) + v[1] + t.substring(l + m) : v[0] === n && (t = t.substring(0, l + m) + t.substring(l + this.diff_xIndex(p, f + v[1].length))), v[0] !== n && (f += v[1].length)
                                }
                            }
                        }
                    }
                    return [t = t.substring(r.length, t.length - r.length), o]
                }, t.prototype.patch_addPadding = function (e) {
                    for (var n = this.Patch_Margin, r = "", i = 1; i <= n; i++) r += String.fromCharCode(i);
                    for (i = 0; i < e.length; i++) e[i].start1 += n, e[i].start2 += n;
                    var o = e[0], a = o.diffs;
                    if (0 == a.length || 0 != a[0][0]) a.unshift(new t.Diff(0, r)), o.start1 -= n, o.start2 -= n, o.length1 += n, o.length2 += n; else if (n > a[0][1].length) {
                        var l = n - a[0][1].length;
                        a[0][1] = r.substring(a[0][1].length) + a[0][1], o.start1 -= l, o.start2 -= l, o.length1 += l, o.length2 += l
                    }
                    if (0 == (a = (o = e[e.length - 1]).diffs).length || 0 != a[a.length - 1][0]) a.push(new t.Diff(0, r)), o.length1 += n, o.length2 += n; else if (n > a[a.length - 1][1].length) {
                        l = n - a[a.length - 1][1].length;
                        a[a.length - 1][1] += r.substring(0, l), o.length1 += l, o.length2 += l
                    }
                    return r
                }, t.prototype.patch_splitMax = function (e) {
                    for (var r = this.Match_MaxBits, i = 0; i < e.length; i++) if (!(e[i].length1 <= r)) {
                        var o = e[i];
                        e.splice(i--, 1);
                        for (var a = o.start1, l = o.start2, s = ""; 0 !== o.diffs.length;) {
                            var d = new t.patch_obj, c = !0;
                            for (d.start1 = a - s.length, d.start2 = l - s.length, "" !== s && (d.length1 = d.length2 = s.length, d.diffs.push(new t.Diff(0, s))); 0 !== o.diffs.length && d.length1 < r - this.Patch_Margin;) {
                                var u = o.diffs[0][0], p = o.diffs[0][1];
                                1 === u ? (d.length2 += p.length, l += p.length, d.diffs.push(o.diffs.shift()), c = !1) : u === n && 1 == d.diffs.length && 0 == d.diffs[0][0] && p.length > 2 * r ? (d.length1 += p.length, a += p.length, c = !1, d.diffs.push(new t.Diff(u, p)), o.diffs.shift()) : (p = p.substring(0, r - d.length1 - this.Patch_Margin), d.length1 += p.length, a += p.length, 0 === u ? (d.length2 += p.length, l += p.length) : c = !1, d.diffs.push(new t.Diff(u, p)), p == o.diffs[0][1] ? o.diffs.shift() : o.diffs[0][1] = o.diffs[0][1].substring(p.length))
                            }
                            s = (s = this.diff_text2(d.diffs)).substring(s.length - this.Patch_Margin);
                            var m = this.diff_text1(o.diffs).substring(0, this.Patch_Margin);
                            "" !== m && (d.length1 += m.length, d.length2 += m.length, 0 !== d.diffs.length && 0 === d.diffs[d.diffs.length - 1][0] ? d.diffs[d.diffs.length - 1][1] += m : d.diffs.push(new t.Diff(0, m))), c || e.splice(++i, 0, d)
                        }
                    }
                }, t.prototype.patch_toText = function (e) {
                    for (var t = [], n = 0; n < e.length; n++) t[n] = e[n];
                    return t.join("")
                }, t.prototype.patch_fromText = function (e) {
                    var r = [];
                    if (!e) return r;
                    for (var i = e.split("\n"), o = 0, a = /^@@ -(\d+),?(\d*) \+(\d+),?(\d*) @@$/; o < i.length;) {
                        var l = i[o].match(a);
                        if (!l) throw new Error("Invalid patch string: " + i[o]);
                        var s = new t.patch_obj;
                        for (r.push(s), s.start1 = parseInt(l[1], 10), "" === l[2] ? (s.start1--, s.length1 = 1) : "0" == l[2] ? s.length1 = 0 : (s.start1--, s.length1 = parseInt(l[2], 10)), s.start2 = parseInt(l[3], 10), "" === l[4] ? (s.start2--, s.length2 = 1) : "0" == l[4] ? s.length2 = 0 : (s.start2--, s.length2 = parseInt(l[4], 10)), o++; o < i.length;) {
                            var d = i[o].charAt(0);
                            try {
                                var c = decodeURI(i[o].substring(1))
                            } catch (e) {
                                throw new Error("Illegal escape in patch_fromText: " + c)
                            }
                            if ("-" == d) s.diffs.push(new t.Diff(n, c)); else if ("+" == d) s.diffs.push(new t.Diff(1, c)); else if (" " == d) s.diffs.push(new t.Diff(0, c)); else {
                                if ("@" == d) break;
                                if ("" !== d) throw new Error('Invalid patch mode "' + d + '" in: ' + c)
                            }
                            o++
                        }
                    }
                    return r
                }, (t.patch_obj = function () {
                    this.diffs = [], this.start1 = null, this.start2 = null, this.length1 = 0, this.length2 = 0
                }).prototype.toString = function () {
                    for (var e, t = ["@@ -" + (0 === this.length1 ? this.start1 + ",0" : 1 == this.length1 ? this.start1 + 1 : this.start1 + 1 + "," + this.length1) + " +" + (0 === this.length2 ? this.start2 + ",0" : 1 == this.length2 ? this.start2 + 1 : this.start2 + 1 + "," + this.length2) + " @@\n"], r = 0; r < this.diffs.length; r++) {
                        switch (this.diffs[r][0]) {
                            case 1:
                                e = "+";
                                break;
                            case n:
                                e = "-";
                                break;
                            case 0:
                                e = " "
                        }
                        t[r + 1] = e + encodeURI(this.diffs[r][1]) + "\n"
                    }
                    return t.join("").replace(/%20/g, " ")
                }, e.exports = t, e.exports.diff_match_patch = t, e.exports.DIFF_DELETE = n, e.exports.DIFF_INSERT = 1, e.exports.DIFF_EQUAL = 0
            }, 872: (e, t, n) => {
                "use strict";
                n.d(t, {default: () => D});
                var r = n(478), i = n(156), o = n(314), a = n(730), l = n(66), s = n(218), d = n(702),
                    c = function (e) {
                        void 0 === e && (e = document);
                        var t = function (e) {
                            var t = document.createElement("img");
                            t.src = e.getAttribute("data-src"), t.addEventListener("load", (function () {
                                e.getAttribute("style") || e.getAttribute("class") || e.getAttribute("width") || e.getAttribute("height") || t.naturalHeight > t.naturalWidth && t.naturalWidth / t.naturalHeight < document.querySelector(".vditor-reset").clientWidth / (window.innerHeight - 40) && t.naturalHeight > window.innerHeight - 40 && (e.style.height = window.innerHeight - 40 + "px"), e.src = t.src
                            })), e.removeAttribute("data-src")
                        };
                        if (!("IntersectionObserver" in window)) return e.querySelectorAll("images").forEach((function (e) {
                            e.getAttribute("data-src") && t(e)
                        })), !1;
                        window.vditorImageIntersectionObserver ? (window.vditorImageIntersectionObserver.disconnect(), e.querySelectorAll("images").forEach((function (e) {
                            window.vditorImageIntersectionObserver.observe(e)
                        }))) : (window.vditorImageIntersectionObserver = new IntersectionObserver((function (e) {
                            e.forEach((function (e) {
                                (void 0 === e.isIntersecting ? 0 !== e.intersectionRatio : e.isIntersecting) && e.target.getAttribute("data-src") && t(e.target)
                            }))
                        })), e.querySelectorAll("images").forEach((function (e) {
                            window.vditorImageIntersectionObserver.observe(e)
                        })))
                    }, u = n(466), p = n(554), m = n(40), f = n(563), h = n(749), v = n(818), g = n(408), y = n(54),
                    b = n(227), w = n(526), E = n(827), k = n(640), S = n(895), L = n(393), C = function (e, t) {
                        if (void 0 === t && (t = "zh_CN"), "undefined" != typeof speechSynthesis && "undefined" != typeof SpeechSynthesisUtterance) {
                            var n = '<svg><use xlink:href="#vditor-icon-play"></use></svg>',
                                r = '<svg><use xlink:href="#vditor-icon-pause"></use></svg>';
                            document.getElementById("vditorIconScript") || (n = '<svg viewBox="0 0 32 32"><path d="M3.436 0l25.128 16-25.128 16v-32z"></path></svg>', r = '<svg viewBox="0 0 32 32"><path d="M20.617 0h9.128v32h-9.128v-32zM2.255 32v-32h9.128v32h-9.128z"></path></svg>');
                            var i = document.querySelector(".vditor-speech");
                            if (!i) {
                                (i = document.createElement("div")).className = "vditor-speech", document.body.insertAdjacentElement("beforeend", i);
                                var o = function () {
                                    var e, n;
                                    return speechSynthesis.getVoices().forEach((function (r) {
                                        r.lang === t.replace("_", "-") && (e = r), r.default && (n = r)
                                    })), e || (e = n), e
                                };
                                void 0 !== speechSynthesis.onvoiceschanged && (speechSynthesis.onvoiceschanged = o);
                                var a = o();
                                i.onclick = function () {
                                    if ("vditor-speech" === i.className) {
                                        var e = new SpeechSynthesisUtterance(i.getAttribute("data-text"));
                                        e.voice = a, e.onend = function () {
                                            i.className = "vditor-speech", speechSynthesis.cancel(), i.innerHTML = n
                                        }, speechSynthesis.speak(e), i.className = "vditor-speech vditor-speech--current", i.innerHTML = r
                                    } else speechSynthesis.speaking && (speechSynthesis.paused ? (speechSynthesis.resume(), i.innerHTML = r) : (speechSynthesis.pause(), i.innerHTML = n));
                                    (0, L.Hc)(window.vditorSpeechRange)
                                }, document.body.addEventListener("click", (function () {
                                    "" === getSelection().toString().trim() && "block" === i.style.display && (i.className = "vditor-speech", speechSynthesis.cancel(), i.style.display = "none")
                                }))
                            }
                            e.addEventListener("mouseup", (function (e) {
                                var t = getSelection().toString().trim();
                                if (speechSynthesis.cancel(), "" !== getSelection().toString().trim()) {
                                    window.vditorSpeechRange = getSelection().getRangeAt(0).cloneRange();
                                    var r = getSelection().getRangeAt(0).getBoundingClientRect();
                                    i.innerHTML = n, i.style.display = "block", i.style.top = r.top + r.height + document.querySelector("html").scrollTop - 20 + "px", i.style.left = e.clientX + 2 + "px", i.setAttribute("data-text", t)
                                } else "block" === i.style.display && (i.className = "vditor-speech", i.style.display = "none")
                            }))
                        }
                    }, T = function (e, t, n, r) {
                        return new (n || (n = Promise))((function (i, o) {
                            function a(e) {
                                try {
                                    s(r.next(e))
                                } catch (e) {
                                    o(e)
                                }
                            }

                            function l(e) {
                                try {
                                    s(r.throw(e))
                                } catch (e) {
                                    o(e)
                                }
                            }

                            function s(e) {
                                var t;
                                e.done ? i(e.value) : (t = e.value, t instanceof n ? t : new n((function (e) {
                                    e(t)
                                }))).then(a, l)
                            }

                            s((r = r.apply(e, t || [])).next())
                        }))
                    }, M = function (e, t) {
                        var n, r, i, o, a = {
                            label: 0, sent: function () {
                                if (1 & i[0]) throw i[1];
                                return i[1]
                            }, trys: [], ops: []
                        };
                        return o = {
                            next: l(0),
                            throw: l(1),
                            return: l(2)
                        }, "function" == typeof Symbol && (o[Symbol.iterator] = function () {
                            return this
                        }), o;

                        function l(o) {
                            return function (l) {
                                return function (o) {
                                    if (n) throw new TypeError("Generator is already executing.");
                                    for (; a;) try {
                                        if (n = 1, r && (i = 2 & o[0] ? r.return : o[0] ? r.throw || ((i = r.return) && i.call(r), 0) : r.next) && !(i = i.call(r, o[1])).done) return i;
                                        switch (r = 0, i && (o = [2 & o[0], i.value]), o[0]) {
                                            case 0:
                                            case 1:
                                                i = o;
                                                break;
                                            case 4:
                                                return a.label++, {value: o[1], done: !1};
                                            case 5:
                                                a.label++, r = o[1], o = [0];
                                                continue;
                                            case 7:
                                                o = a.ops.pop(), a.trys.pop();
                                                continue;
                                            default:
                                                if (!(i = a.trys, (i = i.length > 0 && i[i.length - 1]) || 6 !== o[0] && 2 !== o[0])) {
                                                    a = 0;
                                                    continue
                                                }
                                                if (3 === o[0] && (!i || o[1] > i[0] && o[1] < i[3])) {
                                                    a.label = o[1];
                                                    break
                                                }
                                                if (6 === o[0] && a.label < i[1]) {
                                                    a.label = i[1], i = o;
                                                    break
                                                }
                                                if (i && a.label < i[2]) {
                                                    a.label = i[2], a.ops.push(o);
                                                    break
                                                }
                                                i[2] && a.ops.pop(), a.trys.pop();
                                                continue
                                        }
                                        o = t.call(e, a)
                                    } catch (e) {
                                        o = [6, e], r = 0
                                    } finally {
                                        n = i = 0
                                    }
                                    if (5 & o[0]) throw o[1];
                                    return {value: o[0] ? o[1] : void 0, done: !0}
                                }([o, l])
                            }
                        }
                    }, A = function (e) {
                        var t = {
                            anchor: 0,
                            cdn: y.g.CDN,
                            customEmoji: {},
                            emojiPath: (e && e.emojiPath || y.g.CDN) + "/dist/images/emoji",
                            hljs: y.g.HLJS_OPTIONS,
                            icon: "ant",
                            lang: "zh_CN",
                            markdown: y.g.MARKDOWN_OPTIONS,
                            math: y.g.MATH_OPTIONS,
                            mode: "light",
                            speech: {enable: !1},
                            theme: y.g.THEME_OPTIONS
                        };
                        return (0, k.T)(t, e)
                    }, _ = function (e, t) {
                        var n = A(t);
                        return (0, w.G)(n.cdn + "/dist/js/lute/lute.min.js", "vditorLuteScript").then((function () {
                            var r = (0, S.X)({
                                autoSpace: n.markdown.autoSpace,
                                gfmAutoLink: n.markdown.gfmAutoLink,
                                codeBlockPreview: n.markdown.codeBlockPreview,
                                emojiSite: n.emojiPath,
                                emojis: n.customEmoji,
                                fixTermTypo: n.markdown.fixTermTypo,
                                footnotes: n.markdown.footnotes,
                                headingAnchor: 0 !== n.anchor,
                                inlineMathDigit: n.math.inlineDigit,
                                lazyLoadImage: n.lazyLoadImage,
                                linkBase: n.markdown.linkBase,
                                linkPrefix: n.markdown.linkPrefix,
                                listStyle: n.markdown.listStyle,
                                mark: n.markdown.mark,
                                mathBlockPreview: n.markdown.mathBlockPreview,
                                paragraphBeginningSpace: n.markdown.paragraphBeginningSpace,
                                sanitize: n.markdown.sanitize,
                                toc: n.markdown.toc
                            });
                            return (null == t ? void 0 : t.renderers) && r.SetJSRenderers({renderers: {Md2HTML: t.renderers}}), r.SetHeadingID(!0), r.Md2HTML(e)
                        }))
                    }, x = function (e, t, n) {
                        return T(void 0, void 0, void 0, (function () {
                            var i, v, y;
                            return M(this, (function (k) {
                                switch (k.label) {
                                    case 0:
                                        return i = A(n), [4, _(t, i)];
                                    case 1:
                                        if (v = k.sent(), i.transform && (v = i.transform(v)), e.innerHTML = v, e.classList.add("vditor-reset"), i.i18n) return [3, 5];
                                        if (["en_US", "fr_FR", "pt_BR", "ja_JP", "ko_KR", "ru_RU", "sv_SE", "zh_CN", "zh_TW"].includes(i.lang)) return [3, 2];
                                        throw new Error("options.lang error, see https://ld246.com/article/1549638745630#options");
                                    case 2:
                                        return y = "vditorI18nScript" + i.lang, document.querySelectorAll('head script[id^="vditorI18nScript"]').forEach((function (e) {
                                            e.id !== y && document.head.removeChild(e)
                                        })), [4, (0, w.G)(i.cdn + "/dist/js/i18n/" + i.lang + ".js", y)];
                                    case 3:
                                        k.sent(), k.label = 4;
                                    case 4:
                                        return [3, 6];
                                    case 5:
                                        window.VditorI18n = i.i18n, k.label = 6;
                                    case 6:
                                        return i.icon ? [4, (0, w.G)(i.cdn + "/dist/js/icons/" + i.icon + ".js", "vditorIconScript")] : [3, 8];
                                    case 7:
                                        k.sent(), k.label = 8;
                                    case 8:
                                        return (0, b.Z)(i.theme.current, i.theme.path), 1 === i.anchor && e.classList.add("vditor-reset--anchor"), (0, a.O)(e), (0, d.s)(i.hljs, e, i.cdn), (0, u.H)(e, {
                                            cdn: i.cdn,
                                            math: i.math
                                        }), (0, m.i)(e, i.cdn, i.mode), (0, f.K)(e, i.cdn, i.mode), (0, l.P)(e, i.cdn), (0, s.v)(e, i.cdn), (0, o.p)(e, i.cdn, i.mode), (0, h.P)(e, i.cdn, i.mode), (0, g.B)(e, i.cdn), (0, r.Q)(e, i.cdn), (0, p.Y)(e), i.speech.enable && C(e), 0 !== i.anchor && (S = i.anchor, document.querySelectorAll(".vditor-anchor").forEach((function (e) {
                                            1 === S && e.classList.add("vditor-anchor--left"), e.onclick = function () {
                                                var t = e.getAttribute("href").substr(1),
                                                    n = document.getElementById("vditorAnchor-" + t).offsetTop;
                                                document.querySelector("html").scrollTop = n
                                            }
                                        })), window.onhashchange = function () {
                                            var e = document.getElementById("vditorAnchor-" + decodeURIComponent(window.location.hash.substr(1)));
                                            e && (document.querySelector("html").scrollTop = e.offsetTop)
                                        }), i.after && i.after(), i.lazyLoadImage && c(e), e.addEventListener("click", (function (t) {
                                            var n = (0, E.lG)(t.target, "SPAN");
                                            if (n && (0, E.fb)(n, "vditor-toc")) {
                                                var r = e.querySelector("#" + n.getAttribute("data-target-id"));
                                                r && window.scrollTo(window.scrollX, r.offsetTop)
                                            } else ;
                                        })), [2]
                                }
                                var S
                            }))
                        }))
                    }, H = n(863), N = n(312);
                const D = function () {
                    function e() {
                    }

                    return e.adapterRender = i, e.previewImage = H.E, e.codeRender = a.O, e.graphvizRender = s.v, e.highlightRender = d.s, e.mathRender = u.H, e.mermaidRender = m.i, e.markmapRender = f.K, e.flowchartRender = l.P, e.chartRender = o.p, e.abcRender = r.Q, e.mindmapRender = h.P, e.plantumlRender = g.B, e.outlineRender = v.k, e.mediaRender = p.Y, e.speechRender = C, e.lazyLoadImageRender = c, e.md2html = _, e.preview = x, e.setCodeTheme = N.Y, e.setContentTheme = b.Z, e
                }()
            }, 54: (e, t, n) => {
                "use strict";
                n.d(t, {H: () => r, g: () => i});
                var r = "3.9.4", i = function () {
                    function e() {
                    }

                    return e.ZWSP = "​", e.DROP_EDITOR = "application/editor", e.MOBILE_WIDTH = 520, e.CLASS_MENU_DISABLED = "vditor-menu--disabled", e.EDIT_TOOLBARS = ["emoji", "headings", "bold", "italic", "strike", "link", "list", "ordered-list", "outdent", "indent", "check", "line", "quote", "code", "inline-code", "insert-after", "insert-before", "upload", "record", "table"], e.CODE_THEME = ["abap", "algol", "algol_nu", "arduino", "autumn", "borland", "bw", "colorful", "dracula", "emacs", "friendly", "fruity", "github", "igor", "lovelace", "manni", "monokai", "monokailight", "murphy", "native", "paraiso-dark", "paraiso-light", "pastie", "perldoc", "pygments", "rainbow_dash", "rrt", "solarized-dark", "solarized-dark256", "solarized-light", "swapoff", "tango", "trac", "vim", "vs", "xcode", "ant-design"], e.CODE_LANGUAGES = ["mermaid", "echarts", "mindmap", "plantuml", "abc", "graphviz", "flowchart", "apache", "js", "ts", "html", "markmap", "properties", "apache", "bash", "c", "csharp", "cpp", "css", "coffeescript", "diff", "go", "xml", "http", "json", "java", "javascript", "kotlin", "less", "lua", "makefile", "markdown", "nginx", "objectivec", "php", "php-template", "perl", "plaintext", "python", "python-repl", "r", "ruby", "rust", "scss", "sql", "shell", "swift", "ini", "typescript", "vbnet", "yaml", "ada", "clojure", "dart", "erb", "fortran", "gradle", "haskell", "julia", "julia-repl", "lisp", "matlab", "pgsql", "powershell", "sql_more", "stata", "cmake", "mathematica", "solidity", "yul"], e.CDN = "https://unpkg.com/vditor@3.9.4", e.MARKDOWN_OPTIONS = {
                        autoSpace: !1,
                        gfmAutoLink: !0,
                        codeBlockPreview: !0,
                        fixTermTypo: !1,
                        footnotes: !0,
                        linkBase: "",
                        linkPrefix: "",
                        listStyle: !1,
                        mark: !1,
                        mathBlockPreview: !0,
                        paragraphBeginningSpace: !1,
                        sanitize: !0,
                        toc: !1
                    }, e.HLJS_OPTIONS = {
                        enable: !0,
                        lineNumber: !1,
                        defaultLang: "",
                        style: "github"
                    }, e.MATH_OPTIONS = {
                        engine: "KaTeX",
                        inlineDigit: !1,
                        macros: {}
                    }, e.THEME_OPTIONS = {
                        current: "light",
                        list: {"ant-design": "Ant Design", dark: "Dark", light: "Light", wechat: "WeChat"},
                        path: e.CDN + "/dist/css/content-theme"
                    }, e
                }()
            }, 478: (e, t, n) => {
                "use strict";
                n.d(t, {Q: () => a});
                var r = n(54), i = n(526), o = n(156), a = function (e, t) {
                    void 0 === e && (e = document), void 0 === t && (t = r.g.CDN);
                    var n = o.abcRenderAdapter.getElements(e);
                    n.length > 0 && (0, i.G)(t + "/dist/js/abcjs/abcjs_basic.min.js", "vditorAbcjsScript").then((function () {
                        n.forEach((function (e) {
                            e.parentElement.classList.contains("vditor-wysiwyg__pre") || e.parentElement.classList.contains("vditor-ir__marker--pre") || "true" !== e.getAttribute("data-processed") && (ABCJS.renderAbc(e, o.abcRenderAdapter.getCode(e).trim()), e.style.overflowX = "auto", e.setAttribute("data-processed", "true"))
                        }))
                    }))
                }
            }, 156: (e, t, n) => {
                "use strict";
                n.r(t), n.d(t, {
                    mathRenderAdapter: () => r,
                    mermaidRenderAdapter: () => i,
                    markmapRenderAdapter: () => o,
                    mindmapRenderAdapter: () => a,
                    chartRenderAdapter: () => l,
                    abcRenderAdapter: () => s,
                    graphvizRenderAdapter: () => d,
                    flowchartRenderAdapter: () => c,
                    plantumlRenderAdapter: () => u
                });
                var r = {
                    getCode: function (e) {
                        return e.textContent
                    }, getElements: function (e) {
                        return e.querySelectorAll(".language-math")
                    }
                }, i = {
                    getCode: function (e) {
                        return e.textContent
                    }, getElements: function (e) {
                        return e.querySelectorAll(".language-mermaid")
                    }
                }, o = {
                    getCode: function (e) {
                        return e.textContent
                    }, getElements: function (e) {
                        return e.querySelectorAll(".language-markmap")
                    }
                }, a = {
                    getCode: function (e) {
                        return e.getAttribute("data-code")
                    }, getElements: function (e) {
                        return e.querySelectorAll(".language-mindmap")
                    }
                }, l = {
                    getCode: function (e) {
                        return e.innerText
                    }, getElements: function (e) {
                        return e.querySelectorAll(".language-echarts")
                    }
                }, s = {
                    getCode: function (e) {
                        return e.textContent
                    }, getElements: function (e) {
                        return e.querySelectorAll(".language-abc")
                    }
                }, d = {
                    getCode: function (e) {
                        return e.textContent
                    }, getElements: function (e) {
                        return e.querySelectorAll(".language-graphviz")
                    }
                }, c = {
                    getCode: function (e) {
                        return e.textContent
                    }, getElements: function (e) {
                        return e.querySelectorAll(".language-flowchart")
                    }
                }, u = {
                    getCode: function (e) {
                        return e.textContent
                    }, getElements: function (e) {
                        return e.querySelectorAll(".language-plantuml")
                    }
                }
            }, 314: (e, t, n) => {
                "use strict";
                n.d(t, {p: () => a});
                var r = n(54), i = n(526), o = n(156), a = function (e, t, n) {
                    void 0 === e && (e = document), void 0 === t && (t = r.g.CDN);
                    var a = o.chartRenderAdapter.getElements(e);
                    a.length > 0 && (0, i.G)(t + "/dist/js/echarts/echarts.min.js", "vditorEchartsScript").then((function () {
                        a.forEach((function (e) {
                            if (!e.parentElement.classList.contains("vditor-wysiwyg__pre") && !e.parentElement.classList.contains("vditor-ir__marker--pre")) {
                                var t = o.chartRenderAdapter.getCode(e).trim();
                                if (t) try {
                                    if ("true" === e.getAttribute("data-processed")) return;
                                    var r = JSON.parse(t);
                                    echarts.init(e, "dark" === n ? "dark" : void 0).setOption(r), e.setAttribute("data-processed", "true")
                                } catch (t) {
                                    e.className = "vditor-reset--error", e.innerHTML = "echarts render error: <br>" + t
                                }
                            }
                        }))
                    }))
                }
            }, 730: (e, t, n) => {
                "use strict";
                n.d(t, {O: () => o});
                var r = n(51), i = n(54), o = function (e) {
                    e.querySelectorAll("pre > code").forEach((function (t, n) {
                        var o, a, l;
                        if (!t.parentElement.classList.contains("vditor-wysiwyg__pre") && !t.parentElement.classList.contains("vditor-ir__marker--pre") && !(t.classList.contains("language-mermaid") || t.classList.contains("language-flowchart") || t.classList.contains("language-echarts") || t.classList.contains("language-mindmap") || t.classList.contains("language-plantuml") || t.classList.contains("language-markmap") || t.classList.contains("language-abc") || t.classList.contains("language-graphviz") || t.classList.contains("language-math") || t.style.maxHeight.indexOf("px") > -1 || e.classList.contains("vditor-preview") && n > 5)) {
                            var s = t.innerText;
                            if (t.classList.contains("highlight-chroma")) {
                                var d = document.createElement("code");
                                d.innerHTML = t.innerHTML, d.querySelectorAll(".highlight-ln").forEach((function (e) {
                                    e.remove()
                                })), s = d.innerText
                            } else s.endsWith("\n") && (s = s.substr(0, s.length - 1));
                            var c = '<svg><use xlink:href="#vditor-icon-copy"></use></svg>';
                            document.getElementById("vditorIconScript") || (c = '<svg viewBox="0 0 32 32"><path d="M22.545-0h-17.455c-1.6 0-2.909 1.309-2.909 2.909v20.364h2.909v-20.364h17.455v-2.909zM26.909 5.818h-16c-1.6 0-2.909 1.309-2.909 2.909v20.364c0 1.6 1.309 2.909 2.909 2.909h16c1.6 0 2.909-1.309 2.909-2.909v-20.364c0-1.6-1.309-2.909-2.909-2.909zM26.909 29.091h-16v-20.364h16v20.364z"></path></svg>');
                            var u = document.createElement("div");
                            u.className = "vditor-copy", u.innerHTML = '<span aria-label="' + ((null === (o = window.VditorI18n) || void 0 === o ? void 0 : o.copy) || "复制") + "\"\nonmouseover=\"this.setAttribute('aria-label', '" + ((null === (a = window.VditorI18n) || void 0 === a ? void 0 : a.copy) || "复制") + "')\"\nclass=\"vditor-tooltipped vditor-tooltipped__w\"\nonclick=\"this.previousElementSibling.select();document.execCommand('copy');this.setAttribute('aria-label', '" + ((null === (l = window.VditorI18n) || void 0 === l ? void 0 : l.copied) || "已复制") + "')\">" + c + "</span>";
                            var p = document.createElement("textarea");
                            p.value = (0, r.X)(s), u.insertAdjacentElement("afterbegin", p), t.before(u), t.style.maxHeight = window.outerHeight - 40 + "px", t.insertAdjacentHTML("afterend", '<span style="position: absolute">' + i.g.ZWSP + "</span>")
                        }
                    }))
                }
            }, 66: (e, t, n) => {
                "use strict";
                n.d(t, {P: () => a});
                var r = n(54), i = n(526), o = n(156), a = function (e, t) {
                    void 0 === t && (t = r.g.CDN);
                    var n = o.flowchartRenderAdapter.getElements(e);
                    0 !== n.length && (0, i.G)(t + "/dist/js/flowchart.js/flowchart.min.js", "vditorFlowchartScript").then((function () {
                        n.forEach((function (e) {
                            if ("true" !== e.getAttribute("data-processed")) {
                                var t = flowchart.parse(o.flowchartRenderAdapter.getCode(e));
                                e.innerHTML = "", t.drawSVG(e), e.setAttribute("data-processed", "true")
                            }
                        }))
                    }))
                }
            }, 218: (e, t, n) => {
                "use strict";
                n.d(t, {v: () => a});
                var r = n(54), i = n(526), o = n(156), a = function (e, t) {
                    void 0 === t && (t = r.g.CDN);
                    var n = o.graphvizRenderAdapter.getElements(e);
                    0 !== n.length && (0, i.G)(t + "/dist/js/graphviz/viz.js", "vditorGraphVizScript").then((function () {
                        n.forEach((function (e) {
                            var t = o.graphvizRenderAdapter.getCode(e);
                            if (!e.parentElement.classList.contains("vditor-wysiwyg__pre") && !e.parentElement.classList.contains("vditor-ir__marker--pre") && "true" !== e.getAttribute("data-processed") && "" !== t.trim()) {
                                try {
                                    var n = new Blob(["importScripts('" + document.getElementById("vditorGraphVizScript").src.replace("viz.js", "full.render.js") + "');"], {type: "application/javascript"}),
                                        r = (window.URL || window.webkitURL).createObjectURL(n), i = new Worker(r);
                                    new Viz({worker: i}).renderSVGElement(t).then((function (t) {
                                        e.innerHTML = t.outerHTML
                                    })).catch((function (t) {
                                        e.innerHTML = "graphviz render error: <br>" + t, e.className = "vditor-reset--error"
                                    }))
                                } catch (e) {
                                    console.error("graphviz error", e)
                                }
                                e.setAttribute("data-processed", "true")
                            }
                        }))
                    }))
                }
            }, 702: (e, t, n) => {
                "use strict";
                n.d(t, {s: () => a});
                var r = n(54), i = n(526), o = n(578), a = function (e, t, n) {
                    void 0 === t && (t = document), void 0 === n && (n = r.g.CDN);
                    var a = e.style;
                    r.g.CODE_THEME.includes(a) || (a = "github");
                    var l = document.getElementById("vditorHljsStyle"),
                        s = n + "/dist/js/highlight.js/styles/" + a + ".css";
                    (l && l.href !== s && l.remove(), (0, o.c)(n + "/dist/js/highlight.js/styles/" + a + ".css", "vditorHljsStyle"), !1 !== e.enable) && (0 !== t.querySelectorAll("pre > code").length && (0, i.G)(n + "/dist/js/highlight.js/highlight.pack.js", "vditorHljsScript").then((function () {
                        (0, i.G)(n + "/dist/js/highlight.js/solidity.min.js", "vditorHljsSolidityScript").then((function () {
                            (0, i.G)(n + "/dist/js/highlight.js/yul.min.js", "vditorHljsYulScript").then((function () {
                                t.querySelectorAll("pre > code").forEach((function (t) {
                                    if (!t.parentElement.classList.contains("vditor-ir__marker--pre") && !t.parentElement.classList.contains("vditor-wysiwyg__pre") && !(t.classList.contains("language-mermaid") || t.classList.contains("language-flowchart") || t.classList.contains("language-echarts") || t.classList.contains("language-mindmap") || t.classList.contains("language-plantuml") || t.classList.contains("language-abc") || t.classList.contains("language-graphviz") || t.classList.contains("language-math")) && ("" !== e.defaultLang && -1 === t.className.indexOf("language-") && t.classList.add("language-" + e.defaultLang), hljs.highlightElement(t), e.lineNumber)) {
                                        t.classList.add("vditor-linenumber");
                                        var n = t.querySelector(".vditor-linenumber__temp");
                                        n || ((n = document.createElement("div")).className = "vditor-linenumber__temp", t.insertAdjacentElement("beforeend", n));
                                        var r = getComputedStyle(t).whiteSpace, i = !1;
                                        "pre-wrap" !== r && "pre-line" !== r || (i = !0);
                                        var o = "", a = t.textContent.split(/\r\n|\r|\n/g);
                                        a.pop(), a.map((function (e) {
                                            var t = "";
                                            i && (n.textContent = e || "\n", t = ' style="height:' + n.getBoundingClientRect().height + 'px"'), o += "<span" + t + "></span>"
                                        })), n.style.display = "none", o = '<span class="vditor-linenumber__rows">' + o + "</span>", t.insertAdjacentHTML("beforeend", o)
                                    }
                                }))
                            }))
                        }))
                    })))
                }
            }, 563: (e, t, n) => {
                "use strict";
                n.d(t, {K: () => s});
                var r = n(54), i = n(526), o = n(156), a = {}, l = function (e, t) {
                    var n = window.markmap, r = n.Transformer, i = n.Markmap, o = n.deriveOptions,
                        l = (n.globalCSS, new r);
                    e.innerHTML = '<svg style="width:100%"></svg>';
                    var s = e.firstChild, d = i.create(s, null), c = function (e, t) {
                        var n = e.transform(t), r = Object.keys(n.features).filter((function (e) {
                            return !a[e]
                        }));
                        r.forEach((function (e) {
                            a[e] = !0
                        }));
                        var i = e.getAssets(r), o = i.styles, l = i.scripts, s = window.markmap;
                        return o && s.loadCSS(o), l && s.loadJS(l), n
                    }(l, t), u = c.root, p = c.frontmatter, m = o(null == p ? void 0 : p.markmap);
                    d.setData(u, m), d.fit()
                }, s = function (e, t, n) {
                    void 0 === t && (t = r.g.CDN);
                    var a = o.markmapRenderAdapter.getElements(e);
                    0 !== a.length && (0, i.G)(t + "/src/js/markmap/markmap.min.js", "vditorMermaidScript").then((function () {
                        a.forEach((function (e) {
                            var t = o.markmapRenderAdapter.getCode(e);
                            if ("true" !== e.getAttribute("data-processed") && "" !== t.trim()) {
                                var n = document.createElement("div");
                                n.className = "language-markmap", e.parentNode.appendChild(n), l(n, t), "CODE" == e.parentNode.childNodes[0].nodeName && e.parentNode.removeChild(e.parentNode.childNodes[0])
                            }
                        }))
                    }))
                }
            }, 466: (e, t, n) => {
                "use strict";
                n.d(t, {H: () => s});
                var r = n(54), i = n(526), o = n(578), a = n(51), l = n(156), s = function (e, t) {
                    var n = l.mathRenderAdapter.getElements(e);
                    if (0 !== n.length) {
                        var s = {cdn: r.g.CDN, math: {engine: "KaTeX", inlineDigit: !1, macros: {}}};
                        if (t && t.math && (t.math = Object.assign({}, s.math, t.math)), "KaTeX" === (t = Object.assign({}, s, t)).math.engine) (0, o.c)(t.cdn + "/dist/js/katex/katex.min.css", "vditorKatexStyle"), (0, i.G)(t.cdn + "/dist/js/katex/katex.min.js", "vditorKatexScript").then((function () {
                            (0, i.G)(t.cdn + "/dist/js/katex/mhchem.min.js", "vditorKatexChemScript").then((function () {
                                n.forEach((function (e) {
                                    if (!e.parentElement.classList.contains("vditor-wysiwyg__pre") && !e.parentElement.classList.contains("vditor-ir__marker--pre") && !e.getAttribute("data-math")) {
                                        var t = (0, a.X)(l.mathRenderAdapter.getCode(e));
                                        e.setAttribute("data-math", t);
                                        try {
                                            e.innerHTML = katex.renderToString(t, {
                                                displayMode: "DIV" === e.tagName,
                                                output: "html"
                                            })
                                        } catch (t) {
                                            e.innerHTML = t.message, e.className = "language-math vditor-reset--error"
                                        }
                                        e.addEventListener("copy", (function (e) {
                                            e.stopPropagation(), e.preventDefault();
                                            var t = e.currentTarget.closest(".language-math");
                                            e.clipboardData.setData("text/html", t.innerHTML), e.clipboardData.setData("text/plain", t.getAttribute("data-math"))
                                        }))
                                    }
                                }))
                            }))
                        })); else if ("MathJax" === t.math.engine) {
                            window.MathJax || (window.MathJax = {
                                loader: {paths: {mathjax: t.cdn + "/dist/js/mathjax"}},
                                startup: {typeset: !1},
                                tex: {macros: t.math.macros}
                            }), (0, i.J)(t.cdn + "/dist/js/mathjax/tex-svg-full.js", "protyleMathJaxScript");
                            var d = function (e, t) {
                                var n = (0, a.X)(e.textContent).trim(), r = window.MathJax.getMetricsFor(e);
                                r.display = "DIV" === e.tagName, window.MathJax.tex2svgPromise(n, r).then((function (r) {
                                    e.innerHTML = "", e.setAttribute("data-math", n), e.append(r), window.MathJax.startup.document.clear(), window.MathJax.startup.document.updateDocument();
                                    var i = r.querySelector('[data-mml-node="merror"]');
                                    i && "" !== i.textContent.trim() && (e.innerHTML = i.textContent.trim(), e.className = "vditor-reset--error"), t && t()
                                }))
                            };
                            window.MathJax.startup.promise.then((function () {
                                for (var e = [], t = function (t) {
                                    var r = n[t];
                                    r.parentElement.classList.contains("vditor-wysiwyg__pre") || r.parentElement.classList.contains("vditor-ir__marker--pre") || r.getAttribute("data-math") || !(0, a.X)(r.textContent).trim() || e.push((function (e) {
                                        t === n.length - 1 ? d(r) : d(r, e)
                                    }))
                                }, r = 0; r < n.length; r++) t(r);
                                !function (e) {
                                    if (0 !== e.length) {
                                        var t = 0, n = e[e.length - 1], r = function () {
                                            var i = e[t++];
                                            i === n ? i() : i(r)
                                        };
                                        r()
                                    }
                                }(e)
                            }))
                        }
                    }
                }
            }, 554: (e, t, n) => {
                "use strict";
                n.d(t, {Y: () => r});
                var r = function (e) {
                    e && e.querySelectorAll("a").forEach((function (e) {
                        var t = e.getAttribute("href");
                        t && (t.match(/^.+.(mp4|m4v|ogg|ogv|webm)$/) ? function (e, t) {
                            e.insertAdjacentHTML("afterend", '<video controls="controls" src="' + t + '"></video>'), e.remove()
                        }(e, t) : t.match(/^.+.(mp3|wav|flac)$/) ? function (e, t) {
                            e.insertAdjacentHTML("afterend", '<audio controls="controls" src="' + t + '"></audio>'), e.remove()
                        }(e, t) : function (e, t) {
                            var n = t.match(/\/\/(?:www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w|-]{11})(?:(?:[\?&]t=)(\S+))?/),
                                r = t.match(/\/\/v\.youku\.com\/v_show\/id_(\w+)=*\.html/),
                                i = t.match(/\/\/v\.qq\.com\/x\/cover\/.*\/([^\/]+)\.html\??.*/),
                                o = t.match(/(?:www\.|\/\/)coub\.com\/view\/(\w+)/),
                                a = t.match(/(?:www\.|\/\/)facebook\.com\/([^\/]+)\/videos\/([0-9]+)/),
                                l = t.match(/.+dailymotion.com\/(video|hub)\/(\w+)\?/),
                                s = t.match(/(?:www\.|\/\/)bilibili\.com\/video\/(\w+)/),
                                d = t.match(/(?:www\.|\/\/)ted\.com\/talks\/(\w+)/);
                            n && 11 === n[1].length ? (e.insertAdjacentHTML("afterend", '<iframe class="iframe__video" src="//www.youtube.com/embed/' + n[1] + (n[2] ? "?start=" + n[2] : "") + '"></iframe>'), e.remove()) : r && r[1] ? (e.insertAdjacentHTML("afterend", '<iframe class="iframe__video" src="//player.youku.com/embed/' + r[1] + '"></iframe>'), e.remove()) : i && i[1] ? (e.insertAdjacentHTML("afterend", '<iframe class="iframe__video" src="https://v.qq.com/txp/iframe/player.html?vid=' + i[1] + '"></iframe>'), e.remove()) : o && o[1] ? (e.insertAdjacentHTML("afterend", '<iframe class="iframe__video"\n src="//coub.com/embed/' + o[1] + '?muted=false&autostart=false&originalSize=true&startWithHD=true"></iframe>'), e.remove()) : a && a[0] ? (e.insertAdjacentHTML("afterend", '<iframe class="iframe__video"\n src="https://www.facebook.com/plugins/video.php?href=' + encodeURIComponent(a[0]) + '"></iframe>'), e.remove()) : l && l[2] ? (e.insertAdjacentHTML("afterend", '<iframe class="iframe__video"\n src="https://www.dailymotion.com/embed/video/' + l[2] + '"></iframe>'), e.remove()) : s && s[1] ? (e.insertAdjacentHTML("afterend", '<iframe class="iframe__video"\n src="//player.bilibili.com/player.html?bvid=' + s[1] + '"></iframe>'), e.remove()) : d && d[1] && (e.insertAdjacentHTML("afterend", '<iframe class="iframe__video" src="//embed.ted.com/talks/' + d[1] + '"></iframe>'), e.remove())
                        }(e, t))
                    }))
                }
            }, 40: (e, t, n) => {
                "use strict";
                n.d(t, {i: () => a});
                var r = n(54), i = n(526), o = n(156), a = function (e, t, n) {
                    void 0 === t && (t = r.g.CDN);
                    var a = o.mermaidRenderAdapter.getElements(e);
                    0 !== a.length && (0, i.G)(t + "/dist/js/mermaid/mermaid.min.js", "vditorMermaidScript").then((function () {
                        var e = {
                            securityLevel: "loose",
                            altFontFamily: "sans-serif",
                            fontFamily: "sans-serif",
                            startOnLoad: !1,
                            flowchart: {htmlLabels: !0, useMaxWidth: !0},
                            sequence: {useMaxWidth: !0, diagramMarginX: 8, diagramMarginY: 8, boxMargin: 8},
                            gantt: {leftPadding: 75, rightPadding: 20}
                        };
                        "dark" === n && (e.theme = "dark"), mermaid.initialize(e), a.forEach((function (e) {
                            var t = o.mermaidRenderAdapter.getCode(e);
                            "true" !== e.getAttribute("data-processed") && "" !== t.trim() && (mermaid.init(void 0, e), e.setAttribute("data-processed", "true"))
                        }))
                    }))
                }
            }, 749: (e, t, n) => {
                "use strict";
                n.d(t, {P: () => a});
                var r = n(54), i = n(526), o = n(156), a = function (e, t, n) {
                    void 0 === e && (e = document), void 0 === t && (t = r.g.CDN);
                    var a = o.mindmapRenderAdapter.getElements(e);
                    a.length > 0 && (0, i.G)(t + "/dist/js/echarts/echarts.min.js", "vditorEchartsScript").then((function () {
                        a.forEach((function (e) {
                            if (!e.parentElement.classList.contains("vditor-wysiwyg__pre") && !e.parentElement.classList.contains("vditor-ir__marker--pre")) {
                                var t = o.mindmapRenderAdapter.getCode(e);
                                if (t) try {
                                    if ("true" === e.getAttribute("data-processed")) return;
                                    echarts.init(e, "dark" === n ? "dark" : void 0).setOption({
                                        series: [{
                                            data: [JSON.parse(decodeURIComponent(t))],
                                            initialTreeDepth: -1,
                                            itemStyle: {borderWidth: 0, color: "#4285f4"},
                                            label: {
                                                backgroundColor: "#f6f8fa",
                                                borderColor: "#d1d5da",
                                                borderRadius: 5,
                                                borderWidth: .5,
                                                color: "#586069",
                                                lineHeight: 20,
                                                offset: [-5, 0],
                                                padding: [0, 5],
                                                position: "insideRight"
                                            },
                                            lineStyle: {color: "#d1d5da", width: 1},
                                            roam: !0,
                                            symbol: function (e, t) {
                                                var n;
                                                return (null === (n = null == t ? void 0 : t.data) || void 0 === n ? void 0 : n.children) ? "circle" : "path://"
                                            },
                                            type: "tree"
                                        }], tooltip: {trigger: "item", triggerOn: "mousemove"}
                                    }), e.setAttribute("data-processed", "true")
                                } catch (t) {
                                    e.className = "vditor-reset--error", e.innerHTML = "mindmap render error: <br>" + t
                                }
                            }
                        }))
                    }))
                }
            }, 818: (e, t, n) => {
                "use strict";
                n.d(t, {k: () => o});
                var r = n(64), i = n(466), o = function (e, t, n) {
                    var o = "", a = [];
                    if (Array.from(e.children).forEach((function (e, t) {
                        if ((0, r.W)(e)) {
                            if (n) {
                                var i = e.id.lastIndexOf("_");
                                e.id = e.id.substring(0, -1 === i ? void 0 : i) + "_" + t
                            }
                            a.push(e.id), o += e.outerHTML.replace("<wbr>", "")
                        }
                    })), "" === o) return t.innerHTML = "", "";
                    var l = document.createElement("div");
                    if (n) n.lute.SetToC(!0), "wysiwyg" !== n.currentMode || n.preview.element.contains(e) ? "ir" !== n.currentMode || n.preview.element.contains(e) ? l.innerHTML = n.lute.HTML2VditorDOM("<p>[ToC]</p>" + o) : l.innerHTML = n.lute.SpinVditorIRDOM("<p>[ToC]</p>" + o) : l.innerHTML = n.lute.SpinVditorDOM("<p>[ToC]</p>" + o), n.lute.SetToC(n.options.preview.markdown.toc); else {
                        t.classList.add("vditor-outline");
                        var s = Lute.New();
                        s.SetToC(!0), l.innerHTML = s.HTML2VditorDOM("<p>[ToC]</p>" + o)
                    }
                    var d = l.firstElementChild.querySelectorAll("li > span[data-target-id]");
                    return d.forEach((function (e, t) {
                        if (e.nextElementSibling && "UL" === e.nextElementSibling.tagName) {
                            var n = "<svg class='vditor-outline__action'><use xlink:href='#vditor-icon-down'></use></svg>";
                            document.getElementById("vditorIconScript") || (n = '<svg class="vditor-outline__action" viewBox="0 0 32 32"><path d="M3.76 6.12l12.24 12.213 12.24-12.213 3.76 3.76-16 16-16-16 3.76-3.76z"></path></svg>'), e.innerHTML = n + "<span>" + e.innerHTML + "</span>"
                        } else e.innerHTML = "<svg></svg><span>" + e.innerHTML + "</span>";
                        e.setAttribute("data-target-id", a[t])
                    })), o = l.firstElementChild.innerHTML, 0 === d.length ? (t.innerHTML = "", o) : (t.innerHTML = o, n && (0, i.H)(t, {
                        cdn: n.options.cdn,
                        math: n.options.preview.math
                    }), t.firstElementChild.addEventListener("click", (function (r) {
                        for (var i = r.target; i && !i.isEqualNode(t);) {
                            if (i.classList.contains("vditor-outline__action")) {
                                i.classList.contains("vditor-outline__action--close") ? (i.classList.remove("vditor-outline__action--close"), i.parentElement.nextElementSibling.setAttribute("style", "display:block")) : (i.classList.add("vditor-outline__action--close"), i.parentElement.nextElementSibling.setAttribute("style", "display:none")), r.preventDefault(), r.stopPropagation();
                                break
                            }
                            if (i.getAttribute("data-target-id")) {
                                r.preventDefault(), r.stopPropagation();
                                var o = document.getElementById(i.getAttribute("data-target-id"));
                                if (!o) return;
                                if (n) if ("auto" === n.options.height) {
                                    var a = o.offsetTop + n.element.offsetTop;
                                    n.options.toolbarConfig.pin || (a += n.toolbar.element.offsetHeight), window.scrollTo(window.scrollX, a)
                                } else n.element.offsetTop < window.scrollY && window.scrollTo(window.scrollX, n.element.offsetTop), n.preview.element.contains(e) ? e.parentElement.scrollTop = o.offsetTop : e.scrollTop = o.offsetTop; else window.scrollTo(window.scrollX, o.offsetTop);
                                break
                            }
                            i = i.parentElement
                        }
                    })), o)
                }
            }, 408: (e, t, n) => {
                "use strict";
                n.d(t, {B: () => a});
                var r = n(54), i = n(526), o = n(156), a = function (e, t) {
                    void 0 === e && (e = document), void 0 === t && (t = r.g.CDN);
                    var n = o.plantumlRenderAdapter.getElements(e);
                    0 !== n.length && (0, i.G)(t + "/dist/js/plantuml/plantuml-encoder.min.js", "vditorPlantumlScript").then((function () {
                        n.forEach((function (e) {
                            if (!e.parentElement.classList.contains("vditor-wysiwyg__pre") && !e.parentElement.classList.contains("vditor-ir__marker--pre")) {
                                var t = o.plantumlRenderAdapter.getCode(e).trim();
                                if (t) try {
                                    e.innerHTML = '<images src="http://www.plantuml.com/plantuml/svg/~1' + plantumlEncoder.encode(t) + '">'
                                } catch (t) {
                                    e.className = "vditor-reset--error", e.innerHTML = "plantuml render error: <br>" + t
                                }
                            }
                        }))
                    }))
                }
            }, 895: (e, t, n) => {
                "use strict";
                n.d(t, {X: () => r});
                var r = function (e) {
                    var t = Lute.New();
                    return t.PutEmojis(e.emojis), t.SetEmojiSite(e.emojiSite), t.SetHeadingAnchor(e.headingAnchor), t.SetInlineMathAllowDigitAfterOpenMarker(e.inlineMathDigit), t.SetAutoSpace(e.autoSpace), t.SetToC(e.toc), t.SetFootnotes(e.footnotes), t.SetFixTermTypo(e.fixTermTypo), t.SetVditorCodeBlockPreview(e.codeBlockPreview), t.SetVditorMathBlockPreview(e.mathBlockPreview), t.SetSanitize(e.sanitize), t.SetChineseParagraphBeginningSpace(e.paragraphBeginningSpace), t.SetRenderListStyle(e.listStyle), t.SetLinkBase(e.linkBase), t.SetLinkPrefix(e.linkPrefix), t.SetMark(e.mark), t.SetGFMAutoLink(e.gfmAutoLink), e.lazyLoadImage && t.SetImageLazyLoading(e.lazyLoadImage), t
                }
            }, 863: (e, t, n) => {
                "use strict";
                n.d(t, {E: () => r});
                var r = function (e, t, n) {
                    void 0 === t && (t = "zh_CN"), void 0 === n && (n = "classic");
                    var r = e.getBoundingClientRect();
                    document.body.insertAdjacentHTML("beforeend", '<div class="vditor vditor-images' + ("dark" === n ? " vditor--dark" : "") + '">\n    <div class="vditor-img__bar">\n      <span class="vditor-img__btn" data-deg="0">\n        <svg><use xlink:href="#vditor-icon-redo"></use></svg>\n        ' + window.VditorI18n.spin + "\n      </span>\n      <span class=\"vditor-img__btn\"  onclick=\"this.parentElement.parentElement.outerHTML = '';document.body.style.overflow = ''\">\n        X &nbsp;" + window.VditorI18n.close + '\n      </span>\n    </div>\n    <div class="vditor-img__img" onclick="this.parentElement.outerHTML = \'\';document.body.style.overflow = \'\'">\n      <images style="width: ' + e.width + "px;height:" + e.height + "px;transform: translate3d(" + r.left + "px, " + (r.top - 36) + 'px, 0)" src="' + e.getAttribute("src") + '">\n    </div>\n</div>'), document.body.style.overflow = "hidden";
                    var i = document.querySelector(".vditor-images images"),
                        o = "translate3d(" + Math.max(0, window.innerWidth - e.naturalWidth) / 2 + "px, " + Math.max(0, window.innerHeight - 36 - e.naturalHeight) / 2 + "px, 0)";
                    setTimeout((function () {
                        i.setAttribute("style", "transition: transform .3s ease-in-out;transform: " + o), setTimeout((function () {
                            i.parentElement.scrollTo((i.parentElement.scrollWidth - i.parentElement.clientWidth) / 2, (i.parentElement.scrollHeight - i.parentElement.clientHeight) / 2)
                        }), 400)
                    }));
                    var a = document.querySelector(".vditor-img__btn");
                    a.addEventListener("click", (function () {
                        var t = parseInt(a.getAttribute("data-deg"), 10) + 90;
                        t / 90 % 2 == 1 && e.naturalWidth > i.parentElement.clientHeight ? i.style.transform = "translate3d(" + Math.max(0, window.innerWidth - e.naturalWidth) / 2 + "px, " + (e.naturalWidth / 2 - e.naturalHeight / 2) + "px, 0) rotateZ(" + t + "deg)" : i.style.transform = o + " rotateZ(" + t + "deg)", a.setAttribute("data-deg", t.toString()), setTimeout((function () {
                            i.parentElement.scrollTo((i.parentElement.scrollWidth - i.parentElement.clientWidth) / 2, (i.parentElement.scrollHeight - i.parentElement.clientHeight) / 2)
                        }), 400)
                    }))
                }
            }, 312: (e, t, n) => {
                "use strict";
                n.d(t, {Y: () => o});
                var r = n(54), i = n(578), o = function (e, t) {
                    void 0 === t && (t = r.g.CDN), r.g.CODE_THEME.includes(e) || (e = "github");
                    var n = document.getElementById("vditorHljsStyle"),
                        o = t + "/dist/js/highlight.js/styles/" + e + ".css";
                    n ? n.href !== o && (n.remove(), (0, i.c)(o, "vditorHljsStyle")) : (0, i.c)(o, "vditorHljsStyle")
                }
            }, 227: (e, t, n) => {
                "use strict";
                n.d(t, {Z: () => i});
                var r = n(578), i = function (e, t) {
                    if (e && t) {
                        var n = document.getElementById("vditorContentTheme"), i = t + "/" + e + ".css";
                        n ? n.getAttribute("href") !== i && (n.remove(), (0, r.c)(i, "vditorContentTheme")) : (0, r.c)(i, "vditorContentTheme")
                    }
                }
            }, 526: (e, t, n) => {
                "use strict";
                n.d(t, {J: () => r, G: () => i});
                var r = function (e, t) {
                    if (document.getElementById(t)) return !1;
                    var n = new XMLHttpRequest;
                    n.open("GET", e, !1), n.setRequestHeader("Accept", "text/javascript, application/javascript, application/ecmascript, application/x-ecmascript, */*; q=0.01"), n.send("");
                    var r = document.createElement("script");
                    r.type = "text/javascript", r.text = n.responseText, r.id = t, document.head.appendChild(r)
                }, i = function (e, t) {
                    return new Promise((function (n, r) {
                        if (document.getElementById(t)) return n(), !1;
                        var i = document.createElement("script");
                        i.src = e, i.async = !0, document.head.appendChild(i), i.onload = function () {
                            if (document.getElementById(t)) return i.remove(), n(), !1;
                            i.id = t, n()
                        }
                    }))
                }
            }, 578: (e, t, n) => {
                "use strict";
                n.d(t, {c: () => r});
                var r = function (e, t) {
                    if (!document.getElementById(t)) {
                        var n = document.createElement("link");
                        n.id = t, n.rel = "stylesheet", n.type = "text/css", n.href = e, document.getElementsByTagName("head")[0].appendChild(n)
                    }
                }
            }, 51: (e, t, n) => {
                "use strict";
                n.d(t, {X: () => r});
                var r = function (e) {
                    return e.replace(/\u00a0/g, " ")
                }
            }, 794: (e, t, n) => {
                "use strict";
                n.d(t, {G6: () => r, vU: () => i, pK: () => o, Le: () => a, yl: () => l, ns: () => s, i7: () => d});
                var r = function () {
                    return navigator.userAgent.indexOf("Safari") > -1 && -1 === navigator.userAgent.indexOf("Chrome")
                }, i = function () {
                    return navigator.userAgent.toLowerCase().indexOf("firefox") > -1
                }, o = function () {
                    try {
                        return "undefined" != typeof localStorage
                    } catch (e) {
                        return !1
                    }
                }, a = function () {
                    return navigator.userAgent.indexOf("iPhone") > -1 ? "touchstart" : "click"
                }, l = function (e) {
                    return navigator.platform.toUpperCase().indexOf("MAC") >= 0 ? !(!e.metaKey || e.ctrlKey) : !(e.metaKey || !e.ctrlKey)
                }, s = function (e) {
                    return /Mac/.test(navigator.platform) || "iPhone" === navigator.platform ? e.indexOf("⇧") > -1 && i() && (e = e.replace(";", ":").replace("=", "+").replace("-", "_")) : (e = (e = e.startsWith("⌘") ? e.replace("⌘", "⌘+") : e.startsWith("⌥") && "⌘" !== e.substr(1, 1) ? e.replace("⌥", "⌥+") : e.replace("⇧⌘", "⌘+⇧+").replace("⌥⌘", "⌥+⌘+")).replace("⌘", "Ctrl").replace("⇧", "Shift").replace("⌥", "Alt")).indexOf("Shift") > -1 && (e = e.replace(";", ":").replace("=", "+").replace("-", "_")), e
                }, d = function () {
                    return /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor)
                }
            }, 827: (e, t, n) => {
                "use strict";
                n.d(t, {
                    JQ: () => i,
                    E2: () => o,
                    O9: () => a,
                    a1: () => l,
                    F9: () => s,
                    lG: () => d,
                    fb: () => c,
                    DX: () => u
                });
                var r = n(64), i = function (e, t) {
                    for (var n = c(e, t), r = !1, i = !1; n && !n.classList.contains("vditor-reset") && !i;) (r = c(n.parentElement, t)) ? n = r : i = !0;
                    return n || !1
                }, o = function (e, t) {
                    for (var n = (0, r.S)(e, t), i = !1, o = !1; n && !n.classList.contains("vditor-reset") && !o;) (i = (0, r.S)(n.parentElement, t)) ? n = i : o = !0;
                    return n || !1
                }, a = function (e) {
                    var t = o(e, "UL"), n = o(e, "OL"), r = t;
                    return n && (!t || t && n.contains(t)) && (r = n), r
                }, l = function (e, t, n) {
                    if (!e) return !1;
                    3 === e.nodeType && (e = e.parentElement);
                    for (var r = e, i = !1; r && !i && !r.classList.contains("vditor-reset");) r.getAttribute(t) === n ? i = !0 : r = r.parentElement;
                    return i && r
                }, s = function (e) {
                    if (!e) return !1;
                    3 === e.nodeType && (e = e.parentElement);
                    var t = e, n = !1, r = l(e, "data-block", "0");
                    if (r) return r;
                    for (; t && !n && !t.classList.contains("vditor-reset");) "H1" === t.tagName || "H2" === t.tagName || "H3" === t.tagName || "H4" === t.tagName || "H5" === t.tagName || "H6" === t.tagName || "P" === t.tagName || "BLOCKQUOTE" === t.tagName || "OL" === t.tagName || "UL" === t.tagName ? n = !0 : t = t.parentElement;
                    return n && t
                }, d = function (e, t) {
                    if (!e) return !1;
                    3 === e.nodeType && (e = e.parentElement);
                    for (var n = e, r = !1; n && !r && !n.classList.contains("vditor-reset");) n.nodeName === t ? r = !0 : n = n.parentElement;
                    return r && n
                }, c = function (e, t) {
                    if (!e) return !1;
                    3 === e.nodeType && (e = e.parentElement);
                    for (var n = e, r = !1; n && !r && !n.classList.contains("vditor-reset");) n.classList.contains(t) ? r = !0 : n = n.parentElement;
                    return r && n
                }, u = function (e) {
                    for (; e && e.lastChild;) e = e.lastChild;
                    return e
                }
            }, 64: (e, t, n) => {
                "use strict";
                n.d(t, {S: () => r, W: () => i});
                var r = function (e, t) {
                    if (!e) return !1;
                    3 === e.nodeType && (e = e.parentElement);
                    for (var n = e, r = !1; n && !r && !n.classList.contains("vditor-reset");) 0 === n.nodeName.indexOf(t) ? r = !0 : n = n.parentElement;
                    return r && n
                }, i = function (e) {
                    var t = r(e, "H");
                    return !(!t || 2 !== t.tagName.length || "HR" === t.tagName) && t
                }
            }, 640: (e, t, n) => {
                "use strict";
                n.d(t, {T: () => r});
                var r = function () {
                    for (var e = [], t = 0; t < arguments.length; t++) e[t] = arguments[t];
                    for (var n = {}, i = function (e) {
                        for (var t in e) e.hasOwnProperty(t) && ("[object Object]" === Object.prototype.toString.call(e[t]) ? n[t] = r(n[t], e[t]) : n[t] = e[t])
                    }, o = 0; o < e.length; o++) i(e[o]);
                    return n
                }
            }, 393: (e, t, n) => {
                "use strict";
                n.d(t, {
                    zh: () => a,
                    Ny: () => l,
                    Gb: () => s,
                    Hc: () => d,
                    im: () => c,
                    $j: () => u,
                    ib: () => p,
                    oC: () => m
                });
                var r = n(54), i = n(794), o = n(827), a = function (e) {
                    var t, n = e[e.currentMode].element;
                    return getSelection().rangeCount > 0 && (t = getSelection().getRangeAt(0), n.isEqualNode(t.startContainer) || n.contains(t.startContainer)) ? t : e[e.currentMode].range ? e[e.currentMode].range : (n.focus(), (t = n.ownerDocument.createRange()).setStart(n, 0), t.collapse(!0), t)
                }, l = function (e) {
                    var t = window.getSelection().getRangeAt(0);
                    if (!e.contains(t.startContainer) && !(0, o.fb)(t.startContainer, "vditor-panel--none")) return {
                        left: 0,
                        top: 0
                    };
                    var n, r = e.parentElement.getBoundingClientRect();
                    if (0 === t.getClientRects().length) if (3 === t.startContainer.nodeType) {
                        var i = t.startContainer.parentElement;
                        if (!(i && i.getClientRects().length > 0)) return {left: 0, top: 0};
                        n = i.getClientRects()[0]
                    } else {
                        var a = t.startContainer.children;
                        if (a[t.startOffset] && a[t.startOffset].getClientRects().length > 0) n = a[t.startOffset].getClientRects()[0]; else if (t.startContainer.childNodes.length > 0) {
                            var l = t.cloneRange();
                            t.selectNode(t.startContainer.childNodes[Math.max(0, t.startOffset - 1)]), n = t.getClientRects()[0], t.setEnd(l.endContainer, l.endOffset), t.setStart(l.startContainer, l.startOffset)
                        } else n = t.startContainer.getClientRects()[0];
                        if (!n) {
                            for (var s = t.startContainer.childNodes[t.startOffset]; !s.getClientRects || s.getClientRects && 0 === s.getClientRects().length;) s = s.parentElement;
                            n = s.getClientRects()[0]
                        }
                    } else n = t.getClientRects()[0];
                    return {left: n.left - r.left, top: n.top - r.top}
                }, s = function (e, t) {
                    if (!t) {
                        if (0 === getSelection().rangeCount) return !1;
                        t = getSelection().getRangeAt(0)
                    }
                    var n = t.commonAncestorContainer;
                    return e.isEqualNode(n) || e.contains(n)
                }, d = function (e) {
                    var t = window.getSelection();
                    t.removeAllRanges(), t.addRange(e)
                }, c = function (e, t, n) {
                    var r = {end: 0, start: 0};
                    if (!n) {
                        if (0 === getSelection().rangeCount) return r;
                        n = window.getSelection().getRangeAt(0)
                    }
                    if (s(t, n)) {
                        var i = n.cloneRange();
                        e.childNodes[0] && e.childNodes[0].childNodes[0] ? i.setStart(e.childNodes[0].childNodes[0], 0) : i.selectNodeContents(e), i.setEnd(n.startContainer, n.startOffset), r.start = i.toString().length, r.end = r.start + n.toString().length
                    }
                    return r
                }, u = function (e, t, n) {
                    var r = 0, i = 0, o = n.childNodes[i], a = !1, l = !1;
                    e = Math.max(0, e), t = Math.max(0, t);
                    var s = n.ownerDocument.createRange();
                    for (s.setStart(o || n, 0), s.collapse(!0); !l && o;) {
                        var c = r + o.textContent.length;
                        if (!a && e >= r && e <= c && (0 === e ? s.setStart(o, 0) : 3 === o.childNodes[0].nodeType ? s.setStart(o.childNodes[0], e - r) : o.nextSibling ? s.setStartBefore(o.nextSibling) : s.setStartAfter(o), a = !0, e === t)) {
                            l = !0;
                            break
                        }
                        a && t >= r && t <= c && (0 === t ? s.setEnd(o, 0) : 3 === o.childNodes[0].nodeType ? s.setEnd(o.childNodes[0], t - r) : o.nextSibling ? s.setEndBefore(o.nextSibling) : s.setEndAfter(o), l = !0), r = c, o = n.childNodes[++i]
                    }
                    return !l && n.childNodes[i - 1] && s.setStartBefore(n.childNodes[i - 1]), d(s), s
                }, p = function (e, t) {
                    var n = e.querySelector("wbr");
                    if (n) {
                        if (n.previousElementSibling) if (n.previousElementSibling.isSameNode(n.previousSibling)) {
                            if (n.previousElementSibling.lastChild) return t.setStartBefore(n), t.collapse(!0), d(t), !(0, i.i7)() || "EM" !== n.previousElementSibling.tagName && "STRONG" !== n.previousElementSibling.tagName && "S" !== n.previousElementSibling.tagName || (t.insertNode(document.createTextNode(r.g.ZWSP)), t.collapse(!1)), void n.remove();
                            t.setStartAfter(n.previousElementSibling)
                        } else t.setStart(n.previousSibling, n.previousSibling.textContent.length); else n.previousSibling ? t.setStart(n.previousSibling, n.previousSibling.textContent.length) : n.nextSibling ? 3 === n.nextSibling.nodeType ? t.setStart(n.nextSibling, 0) : t.setStartBefore(n.nextSibling) : t.setStart(n.parentElement, 0);
                        t.collapse(!0), n.remove(), d(t)
                    }
                }, m = function (e, t) {
                    var n = document.createElement("div");
                    n.innerHTML = e;
                    var r = n.querySelectorAll("p");
                    1 === r.length && !r[0].previousSibling && !r[0].nextSibling && t[t.currentMode].element.children.length > 0 && "P" === n.firstElementChild.tagName && (e = r[0].innerHTML.trim());
                    var i = document.createElement("div");
                    i.innerHTML = e;
                    var l = a(t);
                    if ("" !== l.toString() && (t[t.currentMode].preventInput = !0, document.execCommand("delete", !1, "")), i.firstElementChild && "0" === i.firstElementChild.getAttribute("data-block")) {
                        i.lastElementChild.insertAdjacentHTML("beforeend", "<wbr>");
                        var s = (0, o.F9)(l.startContainer);
                        s ? s.insertAdjacentHTML("afterend", i.innerHTML) : t[t.currentMode].element.insertAdjacentHTML("beforeend", i.innerHTML), p(t[t.currentMode].element, l)
                    } else {
                        var c = document.createElement("template");
                        c.innerHTML = e, l.insertNode(c.content.cloneNode(!0)), l.collapse(!1), d(l)
                    }
                }
            }
        }, t = {};

        function n(r) {
            var i = t[r];
            if (void 0 !== i) return i.exports;
            var o = t[r] = {exports: {}};
            return e[r](o, o.exports, n), o.exports
        }

        n.d = (e, t) => {
            for (var r in t) n.o(t, r) && !n.o(e, r) && Object.defineProperty(e, r, {enumerable: !0, get: t[r]})
        }, n.o = (e, t) => Object.prototype.hasOwnProperty.call(e, t), n.r = e => {
            "undefined" != typeof Symbol && Symbol.toStringTag && Object.defineProperty(e, Symbol.toStringTag, {value: "Module"}), Object.defineProperty(e, "__esModule", {value: !0})
        };
        var r = {};
        return (() => {
            "use strict";
            n.d(r, {default: () => Fn});
            var e, t = n(872), i = n(54), o = n(51), a = function (e) {
                    return "sv" === e.currentMode ? (0, o.X)((e.sv.element.textContent + "\n").replace(/\n\n$/, "\n")) : "wysiwyg" === e.currentMode ? e.lute.VditorDOM2Md(e.wysiwyg.element.innerHTML) : "ir" === e.currentMode ? e.lute.VditorIRDOM2Md(e.ir.element.innerHTML) : ""
                }, l = n(526), s = function () {
                    function e() {
                        this.element = document.createElement("div"), this.element.className = "vditor-devtools", this.element.innerHTML = '<div class="vditor-reset--error"></div><div style="height: 100%;"></div>'
                    }

                    return e.prototype.renderEchart = function (e) {
                        var t = this;
                        "block" === e.devtools.element.style.display && (0, l.G)(e.options.cdn + "/dist/js/echarts/echarts.min.js", "vditorEchartsScript").then((function () {
                            t.ASTChart || (t.ASTChart = echarts.init(e.devtools.element.lastElementChild));
                            try {
                                t.element.lastElementChild.style.display = "block", t.element.firstElementChild.innerHTML = "", t.ASTChart.setOption({
                                    series: [{
                                        data: JSON.parse(e.lute.RenderEChartsJSON(a(e))),
                                        initialTreeDepth: -1,
                                        label: {
                                            align: "left",
                                            backgroundColor: "rgba(68, 77, 86, .68)",
                                            borderRadius: 3,
                                            color: "#d1d5da",
                                            fontSize: 12,
                                            lineHeight: 12,
                                            offset: [9, 12],
                                            padding: [2, 4, 2, 4],
                                            position: "top",
                                            verticalAlign: "middle"
                                        },
                                        lineStyle: {color: "#4285f4", type: "curve", width: 1},
                                        orient: "vertical",
                                        roam: !0,
                                        type: "tree"
                                    }],
                                    toolbox: {
                                        bottom: 25,
                                        emphasis: {iconStyle: {color: "#4285f4"}},
                                        feature: {restore: {show: !0}, saveAsImage: {show: !0}},
                                        right: 15,
                                        show: !0
                                    }
                                }), t.ASTChart.resize()
                            } catch (e) {
                                t.element.lastElementChild.style.display = "none", t.element.firstElementChild.innerHTML = e
                            }
                        }))
                    }, e
                }(), d = n(794), c = function (e, t) {
                    t.forEach((function (t) {
                        if (e[t]) {
                            var n = e[t].children[0];
                            n && n.classList.contains("vditor-menu--current") && n.classList.remove("vditor-menu--current")
                        }
                    }))
                }, u = function (e, t) {
                    t.forEach((function (t) {
                        if (e[t]) {
                            var n = e[t].children[0];
                            n && !n.classList.contains("vditor-menu--current") && n.classList.add("vditor-menu--current")
                        }
                    }))
                }, p = function (e, t) {
                    t.forEach((function (t) {
                        if (e[t]) {
                            var n = e[t].children[0];
                            n && n.classList.contains(i.g.CLASS_MENU_DISABLED) && n.classList.remove(i.g.CLASS_MENU_DISABLED)
                        }
                    }))
                }, m = function (e, t) {
                    t.forEach((function (t) {
                        if (e[t]) {
                            var n = e[t].children[0];
                            n && !n.classList.contains(i.g.CLASS_MENU_DISABLED) && n.classList.add(i.g.CLASS_MENU_DISABLED)
                        }
                    }))
                }, f = function (e, t) {
                    t.forEach((function (t) {
                        e[t] && e[t] && (e[t].style.display = "none")
                    }))
                }, h = function (e, t) {
                    t.forEach((function (t) {
                        e[t] && e[t] && (e[t].style.display = "block")
                    }))
                }, v = function (e, t, n) {
                    t.includes("subToolbar") && (e.toolbar.element.querySelectorAll(".vditor-hint").forEach((function (e) {
                        n && e.isEqualNode(n) || (e.style.display = "none")
                    })), e.toolbar.elements.emoji && (e.toolbar.elements.emoji.lastElementChild.style.display = "none")), t.includes("hint") && (e.hint.element.style.display = "none"), e.wysiwyg.popover && t.includes("popover") && (e.wysiwyg.popover.style.display = "none")
                }, g = function (e, t, n, r) {
                    n.addEventListener((0, d.Le)(), (function (r) {
                        r.preventDefault(), r.stopPropagation(), n.classList.contains(i.g.CLASS_MENU_DISABLED) || (e.toolbar.element.querySelectorAll(".vditor-hint--current").forEach((function (e) {
                            e.classList.remove("vditor-hint--current")
                        })), "block" === t.style.display ? t.style.display = "none" : (v(e, ["subToolbar", "hint", "popover"], n.parentElement.parentElement), n.classList.contains("vditor-tooltipped") || n.classList.add("vditor-hint--current"), t.style.display = "block", e.toolbar.element.getBoundingClientRect().right - n.getBoundingClientRect().right < 250 ? t.classList.add("vditor-panel--left") : t.classList.remove("vditor-panel--left")))
                    }))
                }, y = n(827), b = n(64), w = function (e, t, n, r) {
                    r && console.log(e + " - " + n + ": " + t)
                }, E = n(478), k = n(314), S = n(730), L = n(66), C = n(218), T = n(702), M = n(466), A = n(40), _ = n(563),
                x = n(749), H = n(408), N = function (e, t) {
                    if (e) if ("html-block" !== e.parentElement.getAttribute("data-type")) {
                        var n = e.firstElementChild.className.replace("language-", "");
                        "abc" === n ? (0, E.Q)(e, t.options.cdn) : "mermaid" === n ? (0, A.i)(e, t.options.cdn, t.options.theme) : "markmap" === n ? (0, _.K)(e, t.options.cdn, t.options.theme) : "flowchart" === n ? (0, L.P)(e, t.options.cdn) : "echarts" === n ? (0, k.p)(e, t.options.cdn, t.options.theme) : "mindmap" === n ? (0, x.P)(e, t.options.cdn, t.options.theme) : "plantuml" === n ? (0, H.B)(e, t.options.cdn) : "graphviz" === n ? (0, C.v)(e, t.options.cdn) : "math" === n ? (0, M.H)(e, {
                            cdn: t.options.cdn,
                            math: t.options.preview.math
                        }) : ((0, T.s)(Object.assign({}, t.options.preview.hljs), e, t.options.cdn), (0, S.O)(e)), e.setAttribute("data-render", "1")
                    } else e.setAttribute("data-render", "1")
                }, D = n(393), O = function (e) {
                    if ("sv" !== e.currentMode) {
                        var t = e[e.currentMode].element, n = e.outline.render(e);
                        "" === n && (n = "[ToC]"), t.querySelectorAll('[data-type="toc-block"]').forEach((function (t) {
                            t.innerHTML = n, (0, M.H)(t, {cdn: e.options.cdn, math: e.options.preview.math})
                        }))
                    }
                }, I = function (e, t) {
                    var n = (0, y.lG)(e.target, "SPAN");
                    if (n && (0, y.fb)(n, "vditor-toc")) {
                        var r = t[t.currentMode].element.querySelector("#" + n.getAttribute("data-target-id"));
                        if (r) if ("auto" === t.options.height) {
                            var i = r.offsetTop + t.element.offsetTop;
                            t.options.toolbarConfig.pin || (i += t.toolbar.element.offsetHeight), window.scrollTo(window.scrollX, i)
                        } else t.element.offsetTop < window.scrollY && window.scrollTo(window.scrollX, t.element.offsetTop), t[t.currentMode].element.scrollTop = r.offsetTop
                    } else ;
                }, j = function (e, t, n, r) {
                    if (e.previousElementSibling && e.previousElementSibling.classList.contains("vditor-toc")) {
                        if ("Backspace" === n.key && 0 === (0, D.im)(e, t[t.currentMode].element, r).start) return e.previousElementSibling.remove(), dt(t), !0;
                        if (nt(t, n, r, e, e.previousElementSibling)) return !0
                    }
                    if (e.nextElementSibling && e.nextElementSibling.classList.contains("vditor-toc")) {
                        if ("Delete" === n.key && (0, D.im)(e, t[t.currentMode].element, r).start >= e.textContent.trimRight().length) return e.nextElementSibling.remove(), dt(t), !0;
                        if (tt(t, n, r, e, e.nextElementSibling)) return !0
                    }
                    if ("Backspace" === n.key || "Delete" === n.key) {
                        var i = (0, y.fb)(r.startContainer, "vditor-toc");
                        if (i) return i.remove(), dt(t), !0
                    }
                }, R = function (e, t, n, r) {
                    void 0 === n && (n = !1);
                    var o = (0, y.F9)(t.startContainer);
                    if (o && !n && "code-block" !== o.getAttribute("data-type")) {
                        if (lt(o.innerHTML) && o.previousElementSibling || st(o.innerHTML)) return;
                        for (var l = (0, D.im)(o, e.ir.element, t).start, s = !0, d = l - 1; d > o.textContent.substr(0, l).lastIndexOf("\n"); d--) if (" " !== o.textContent.charAt(d) && "\t" !== o.textContent.charAt(d)) {
                            s = !1;
                            break
                        }
                        0 === l && (s = !1);
                        var c = !0;
                        for (d = l - 1; d < o.textContent.length; d++) if (" " !== o.textContent.charAt(d) && "\n" !== o.textContent.charAt(d)) {
                            c = !1;
                            break
                        }
                        if (s) return void ("function" == typeof e.options.input && e.options.input(a(e)));
                        if (c) if (!(0, y.fb)(t.startContainer, "vditor-ir__marker")) {
                            var u = t.startContainer.previousSibling;
                            return u && 3 !== u.nodeType && u.classList.contains("vditor-ir__node--expand") && u.classList.remove("vditor-ir__node--expand"), void ("function" == typeof e.options.input && e.options.input(a(e)))
                        }
                    }
                    if (e.ir.element.querySelectorAll(".vditor-ir__node--expand").forEach((function (e) {
                        e.classList.remove("vditor-ir__node--expand")
                    })), o || (o = e.ir.element), !o.querySelector("wbr")) {
                        var p = (0, y.fb)(t.startContainer, "vditor-ir__preview");
                        p ? p.previousElementSibling.insertAdjacentHTML("beforeend", "<wbr>") : t.insertNode(document.createElement("wbr"))
                    }
                    o.querySelectorAll("[style]").forEach((function (e) {
                        e.removeAttribute("style")
                    })), "link-ref-defs-block" === o.getAttribute("data-type") && (o = e.ir.element);
                    var m, f = o.isEqualNode(e.ir.element), h = (0, y.a1)(o, "data-type", "footnotes-block"), v = "";
                    if (f) v = o.innerHTML; else {
                        var g = (0, b.S)(t.startContainer, "BLOCKQUOTE"), E = (0, y.O9)(t.startContainer);
                        if (E && (o = E), g && (!E || E && !g.contains(E)) && (o = g), h && (o = h), v = o.outerHTML, "UL" === o.tagName || "OL" === o.tagName) {
                            var k = o.previousElementSibling, S = o.nextElementSibling;
                            !k || "UL" !== k.tagName && "OL" !== k.tagName || (v = k.outerHTML + v, k.remove()), !S || "UL" !== S.tagName && "OL" !== S.tagName || (v += S.outerHTML, S.remove()), v = v.replace("<div><wbr><br></div>", "<li><p><wbr><br></p></li>")
                        } else o.previousElementSibling && "" !== o.previousElementSibling.textContent.replace(i.g.ZWSP, "") && r && "insertParagraph" === r.inputType && (v = o.previousElementSibling.outerHTML + v, o.previousElementSibling.remove());
                        o.innerText.startsWith("```") || (e.ir.element.querySelectorAll("[data-type='link-ref-defs-block']").forEach((function (e) {
                            e && !o.isEqualNode(e) && (v += e.outerHTML, e.remove())
                        })), e.ir.element.querySelectorAll("[data-type='footnotes-block']").forEach((function (e) {
                            e && !o.isEqualNode(e) && (v += e.outerHTML, e.remove())
                        })))
                    }
                    if (w("SpinVditorIRDOM", v, "argument", e.options.debugger), v = e.lute.SpinVditorIRDOM(v), w("SpinVditorIRDOM", v, "result", e.options.debugger), f) o.innerHTML = v; else if (o.outerHTML = v, h) {
                        var L = (0, y.a1)(e.ir.element.querySelector("wbr"), "data-type", "footnotes-def");
                        if (L) {
                            var C = L.textContent, T = C.substring(1, C.indexOf("]:")),
                                M = e.ir.element.querySelector('sup[data-type="footnotes-ref"][data-footnotes-label="' + T + '"]');
                            M && M.setAttribute("aria-label", C.substr(T.length + 3).trim().substr(0, 24))
                        }
                    }
                    var A, _ = e.ir.element.querySelectorAll("[data-type='link-ref-defs-block']");
                    _.forEach((function (e, t) {
                        0 === t ? m = e : (m.insertAdjacentHTML("beforeend", e.innerHTML), e.remove())
                    })), _.length > 0 && e.ir.element.insertAdjacentElement("beforeend", _[0]);
                    var x = e.ir.element.querySelectorAll("[data-type='footnotes-block']");
                    x.forEach((function (e, t) {
                        0 === t ? A = e : (A.insertAdjacentHTML("beforeend", e.innerHTML), e.remove())
                    })), x.length > 0 && e.ir.element.insertAdjacentElement("beforeend", x[0]), (0, D.ib)(e.ir.element, t), e.ir.element.querySelectorAll(".vditor-ir__preview[data-render='2']").forEach((function (t) {
                        N(t, e)
                    })), O(e), Mt(e, {enableAddUndoStack: !0, enableHint: !0, enableInput: !0})
                }, P = function (e, t) {
                    if ("" === e) return !1;
                    if (-1 === e.indexOf("⇧") && -1 === e.indexOf("⌘") && -1 === e.indexOf("⌥")) return !((0, d.yl)(t) || t.altKey || t.shiftKey || t.code !== e);
                    if ("⇧Tab" === e) return !((0, d.yl)(t) || t.altKey || !t.shiftKey || "Tab" !== t.code);
                    var n = e.split("");
                    if (e.startsWith("⌥")) {
                        var r = 3 === n.length ? n[2] : n[1];
                        return !((3 === n.length ? !(0, d.yl)(t) : (0, d.yl)(t)) || !t.altKey || t.shiftKey || t.code !== (/^[0-9]$/.test(r) ? "Digit" : "Key") + r)
                    }
                    "⌘Enter" === e && (n = ["⌘", "Enter"]);
                    var i = n.length > 2 && "⇧" === n[0], o = i ? n[2] : n[1];
                    return !i || !(0, d.vU)() && /Mac/.test(navigator.platform) || ("-" === o ? o = "_" : "=" === o && (o = "+")), !(!(0, d.yl)(t) || t.key.toLowerCase() !== o.toLowerCase() || t.altKey || !(!i && !t.shiftKey || i && t.shiftKey))
                }, q = function (e, t) {
                    t.ir.element.querySelectorAll(".vditor-ir__node--expand").forEach((function (e) {
                        e.classList.remove("vditor-ir__node--expand")
                    }));
                    var n = (0, y.JQ)(e.startContainer, "vditor-ir__node"),
                        r = !e.collapsed && (0, y.JQ)(e.endContainer, "vditor-ir__node");
                    if (e.collapsed || n && n === r) {
                        n && (n.classList.add("vditor-ir__node--expand"), n.classList.remove("vditor-ir__node--hidden"), (0, D.Hc)(e));
                        var i = function (e) {
                            var t = e.startContainer;
                            if (3 === t.nodeType && t.nodeValue.length !== e.startOffset) return !1;
                            for (var n = t.nextSibling; n && "" === n.textContent;) n = n.nextSibling;
                            if (!n) {
                                var r = (0, y.fb)(t, "vditor-ir__marker");
                                if (r && !r.nextSibling) {
                                    var i = t.parentElement.parentElement.nextSibling;
                                    if (i && 3 !== i.nodeType && i.classList.contains("vditor-ir__node")) return i
                                }
                                return !1
                            }
                            return !(!n || 3 === n.nodeType || !n.classList.contains("vditor-ir__node") || n.getAttribute("data-block")) && n
                        }(e);
                        if (i) return i.classList.add("vditor-ir__node--expand"), void i.classList.remove("vditor-ir__node--hidden");
                        var o = function (e) {
                            var t = e.startContainer, n = t.previousSibling;
                            return !(3 !== t.nodeType || 0 !== e.startOffset || !n || 3 === n.nodeType || !n.classList.contains("vditor-ir__node") || n.getAttribute("data-block")) && n
                        }(e);
                        return o ? (o.classList.add("vditor-ir__node--expand"), void o.classList.remove("vditor-ir__node--hidden")) : void 0
                    }
                }, B = n(863), V = function (e, t) {
                    var n, r = getSelection().getRangeAt(0).cloneRange(), i = r.startContainer;
                    3 !== r.startContainer.nodeType && "DIV" === r.startContainer.tagName && (i = r.startContainer.childNodes[r.startOffset - 1]);
                    var o = (0, y.a1)(i, "data-block", "0");
                    if (o && t && ("deleteContentBackward" === t.inputType || " " === t.data)) {
                        for (var a = (0, D.im)(o, e.sv.element, r).start, l = !0, s = a - 1; s > o.textContent.substr(0, a).lastIndexOf("\n"); s--) if (" " !== o.textContent.charAt(s) && "\t" !== o.textContent.charAt(s)) {
                            l = !1;
                            break
                        }
                        if (0 === a && (l = !1), l) return void Ie(e);
                        if ("deleteContentBackward" === t.inputType) {
                            var d = (0, y.a1)(i, "data-type", "code-block-open-marker") || (0, y.a1)(i, "data-type", "code-block-close-marker");
                            if (d) {
                                var c;
                                if ("code-block-close-marker" === d.getAttribute("data-type")) if (c = Ne(i, "code-block-open-marker")) return c.textContent = d.textContent, void Ie(e);
                                if ("code-block-open-marker" === d.getAttribute("data-type")) if (c = Ne(i, "code-block-close-marker", !1)) return c.textContent = d.textContent, void Ie(e)
                            }
                            var u = (0, y.a1)(i, "data-type", "math-block-open-marker");
                            if (u) {
                                var p = u.nextElementSibling.nextElementSibling;
                                return void (p && "math-block-close-marker" === p.getAttribute("data-type") && (p.remove(), Ie(e)))
                            }
                            o.querySelectorAll('[data-type="code-block-open-marker"]').forEach((function (e) {
                                1 === e.textContent.length && e.remove()
                            })), o.querySelectorAll('[data-type="code-block-close-marker"]').forEach((function (e) {
                                1 === e.textContent.length && e.remove()
                            }));
                            var m = (0, y.a1)(i, "data-type", "heading-marker");
                            if (m && -1 === m.textContent.indexOf("#")) return void Ie(e)
                        }
                        if ((" " === t.data || "deleteContentBackward" === t.inputType) && ((0, y.a1)(i, "data-type", "padding") || (0, y.a1)(i, "data-type", "li-marker") || (0, y.a1)(i, "data-type", "task-marker") || (0, y.a1)(i, "data-type", "blockquote-marker"))) return void Ie(e)
                    }
                    if (o && "$$" === o.textContent.trimRight()) Ie(e); else {
                        o || (o = e.sv.element), "link-ref-defs-block" === (null === (n = o.firstElementChild) || void 0 === n ? void 0 : n.getAttribute("data-type")) && (o = e.sv.element), (0, y.a1)(i, "data-type", "footnotes-link") && (o = e.sv.element), -1 === o.textContent.indexOf(Lute.Caret) && r.insertNode(document.createTextNode(Lute.Caret)), o.querySelectorAll("[style]").forEach((function (e) {
                            e.removeAttribute("style")
                        })), o.querySelectorAll("font").forEach((function (e) {
                            e.outerHTML = e.innerHTML
                        }));
                        var f, h = o.textContent, v = o.isEqualNode(e.sv.element);
                        v ? h = o.textContent : (o.previousElementSibling && (h = o.previousElementSibling.textContent + h, o.previousElementSibling.remove()), o.previousElementSibling && 0 === h.indexOf("---\n") && (h = o.previousElementSibling.textContent + h, o.previousElementSibling.remove()), o.innerText.startsWith("```") || (e.sv.element.querySelectorAll("[data-type='link-ref-defs-block']").forEach((function (e, t) {
                            0 === t && e && !o.isEqualNode(e.parentElement) && (h += "\n" + e.parentElement.textContent, e.parentElement.remove())
                        })), e.sv.element.querySelectorAll("[data-type='footnotes-link']").forEach((function (e, t) {
                            0 === t && e && !o.isEqualNode(e.parentElement) && (h += "\n" + e.parentElement.textContent, e.parentElement.remove())
                        })))), h = De(h, e), v ? o.innerHTML = h : o.outerHTML = h;
                        var g, b = e.sv.element.querySelectorAll("[data-type='link-ref-defs-block']");
                        b.forEach((function (e, t) {
                            0 === t ? f = e.parentElement : (f.lastElementChild.remove(), f.insertAdjacentHTML("beforeend", "" + e.parentElement.innerHTML), e.parentElement.remove())
                        })), b.length > 0 && e.sv.element.insertAdjacentElement("beforeend", f);
                        var w = e.sv.element.querySelectorAll("[data-type='footnotes-link']");
                        w.forEach((function (e, t) {
                            0 === t ? g = e.parentElement : (g.lastElementChild.remove(), g.insertAdjacentHTML("beforeend", "" + e.parentElement.innerHTML), e.parentElement.remove())
                        })), w.length > 0 && e.sv.element.insertAdjacentElement("beforeend", g), (0, D.ib)(e.sv.element, r), Ae(e), Ie(e, {
                            enableAddUndoStack: !0,
                            enableHint: !0,
                            enableInput: !0
                        })
                    }
                }, U = n(227), W = function (e) {
                    "dark" === e.options.theme ? e.element.classList.add("vditor--dark") : e.element.classList.remove("vditor--dark")
                }, z = function (e) {
                    var t = window.innerWidth <= i.g.MOBILE_WIDTH ? 10 : 35;
                    if ("none" !== e.wysiwyg.element.parentElement.style.display) {
                        var n = (e.wysiwyg.element.parentElement.clientWidth - e.options.preview.maxWidth) / 2;
                        e.wysiwyg.element.style.padding = "10px " + Math.max(t, n) + "px"
                    }
                    if ("none" !== e.ir.element.parentElement.style.display) {
                        n = (e.ir.element.parentElement.clientWidth - e.options.preview.maxWidth) / 2;
                        e.ir.element.style.padding = "10px " + Math.max(t, n) + "px"
                    }
                    "block" !== e.preview.element.style.display ? e.toolbar.element.style.paddingLeft = Math.max(5, parseInt(e[e.currentMode].element.style.paddingLeft || "0", 10) + ("left" === e.options.outline.position ? e.outline.element.offsetWidth : 0)) + "px" : e.toolbar.element.style.paddingLeft = 5 + ("left" === e.options.outline.position ? e.outline.element.offsetWidth : 0) + "px"
                }, G = function (e) {
                    if (e.options.typewriterMode) {
                        var t = window.innerHeight;
                        "number" == typeof e.options.height ? (t = e.options.height, "number" == typeof e.options.minHeight && (t = Math.max(t, e.options.minHeight)), t = Math.min(window.innerHeight, t)) : t = e.element.clientHeight, e.element.classList.contains("vditor--fullscreen") && (t = window.innerHeight), e[e.currentMode].element.style.setProperty("--editor-bottom", (t - e.toolbar.element.offsetHeight) / 2 + "px")
                    }
                };

            function K() {
                window.removeEventListener("resize", e)
            }

            var F, Z, J = function (t) {
                G(t), K(), window.addEventListener("resize", e = function () {
                    z(t), G(t)
                });
                var n = (0, d.pK)() && localStorage.getItem(t.options.cache.id);
                return t.options.cache.enable && n || (t.options.value ? n = t.options.value : t.originalInnerHTML ? n = t.lute.HTML2Md(t.originalInnerHTML) : t.options.cache.enable || (n = "")), n || ""
            }, X = function (e) {
                clearTimeout(e[e.currentMode].hlToolbarTimeoutId), e[e.currentMode].hlToolbarTimeoutId = window.setTimeout((function () {
                    if ("false" !== e[e.currentMode].element.getAttribute("contenteditable") && (0, D.Gb)(e[e.currentMode].element)) {
                        c(e.toolbar.elements, i.g.EDIT_TOOLBARS), p(e.toolbar.elements, i.g.EDIT_TOOLBARS);
                        var t = (0, D.zh)(e), n = t.startContainer;
                        3 === t.startContainer.nodeType && (n = t.startContainer.parentElement), n.classList.contains("vditor-reset") && (n = n.childNodes[t.startOffset]), ("sv" === e.currentMode ? (0, y.a1)(n, "data-type", "heading") : (0, b.W)(n)) && u(e.toolbar.elements, ["headings"]), ("sv" === e.currentMode ? (0, y.a1)(n, "data-type", "blockquote") : (0, y.lG)(n, "BLOCKQUOTE")) && u(e.toolbar.elements, ["quote"]), (0, y.a1)(n, "data-type", "strong") && u(e.toolbar.elements, ["bold"]), (0, y.a1)(n, "data-type", "em") && u(e.toolbar.elements, ["italic"]), (0, y.a1)(n, "data-type", "s") && u(e.toolbar.elements, ["strike"]), (0, y.a1)(n, "data-type", "a") && u(e.toolbar.elements, ["link"]);
                        var r = (0, y.lG)(n, "LI");
                        r ? (r.classList.contains("vditor-task") ? u(e.toolbar.elements, ["check"]) : "OL" === r.parentElement.tagName ? u(e.toolbar.elements, ["ordered-list"]) : "UL" === r.parentElement.tagName && u(e.toolbar.elements, ["list"]), p(e.toolbar.elements, ["outdent", "indent"])) : m(e.toolbar.elements, ["outdent", "indent"]), (0, y.a1)(n, "data-type", "code-block") && (m(e.toolbar.elements, ["headings", "bold", "italic", "strike", "line", "quote", "list", "ordered-list", "check", "code", "inline-code", "upload", "link", "table", "record"]), u(e.toolbar.elements, ["code"])), (0, y.a1)(n, "data-type", "code") && (m(e.toolbar.elements, ["headings", "bold", "italic", "strike", "line", "quote", "list", "ordered-list", "check", "code", "upload", "link", "table", "record"]), u(e.toolbar.elements, ["inline-code"])), (0, y.a1)(n, "data-type", "table") && m(e.toolbar.elements, ["headings", "list", "ordered-list", "check", "line", "quote", "code", "table"])
                    }
                }), 200)
            }, Y = function (e, t) {
                void 0 === t && (t = {
                    enableAddUndoStack: !0,
                    enableHint: !1,
                    enableInput: !0
                }), t.enableHint && e.hint.render(e), clearTimeout(e.wysiwyg.afterRenderTimeoutId), e.wysiwyg.afterRenderTimeoutId = window.setTimeout((function () {
                    if (!e.wysiwyg.composingLock) {
                        var n = a(e);
                        "function" == typeof e.options.input && t.enableInput && e.options.input(n), e.options.counter.enable && e.counter.render(e, n), e.options.cache.enable && (0, d.pK)() && (localStorage.setItem(e.options.cache.id, n), e.options.cache.after && e.options.cache.after(n)), e.devtools && e.devtools.renderEchart(e), t.enableAddUndoStack && e.undo.addToUndoStack(e)
                    }
                }), e.options.undoDelay)
            }, Q = function (e) {
                for (var t = "", n = e.nextSibling; n;) 3 === n.nodeType ? t += n.textContent : t += n.outerHTML, n = n.nextSibling;
                return t
            }, $ = function (e) {
                for (var t = "", n = e.previousSibling; n;) t = 3 === n.nodeType ? n.textContent + t : n.outerHTML + t, n = n.previousSibling;
                return t
            }, ee = function (e, t) {
                Array.from(e.wysiwyg.element.childNodes).find((function (n) {
                    if (3 === n.nodeType) {
                        var r = document.createElement("p");
                        r.setAttribute("data-block", "0"), r.textContent = n.textContent;
                        var i = 3 === t.startContainer.nodeType ? t.startOffset : n.textContent.length;
                        return n.parentNode.insertBefore(r, n), n.remove(), t.setStart(r.firstChild, Math.min(r.firstChild.textContent.length, i)), t.collapse(!0), (0, D.Hc)(t), !0
                    }
                    if (!n.getAttribute("data-block")) return "P" === n.tagName ? n.remove() : ("DIV" === n.tagName ? (t.insertNode(document.createElement("wbr")), n.outerHTML = '<p data-block="0">' + n.innerHTML + "</p>") : "BR" === n.tagName ? n.outerHTML = '<p data-block="0">' + n.outerHTML + "<wbr></p>" : (t.insertNode(document.createElement("wbr")), n.outerHTML = '<p data-block="0">' + n.outerHTML + "</p>"), (0, D.ib)(e.wysiwyg.element, t), t = getSelection().getRangeAt(0)), !0
                }))
            }, te = function (e, t) {
                var n = (0, D.zh)(e), r = (0, y.F9)(n.startContainer);
                r || (r = n.startContainer.childNodes[n.startOffset]), r || 0 !== e.wysiwyg.element.children.length || (r = e.wysiwyg.element), r && !r.classList.contains("vditor-wysiwyg__block") && (n.insertNode(document.createElement("wbr")), "<wbr>" === r.innerHTML.trim() && (r.innerHTML = "<wbr><br>"), "BLOCKQUOTE" === r.tagName || r.classList.contains("vditor-reset") ? r.innerHTML = "<" + t + ' data-block="0">' + r.innerHTML.trim() + "</" + t + ">" : r.outerHTML = "<" + t + ' data-block="0">' + r.innerHTML.trim() + "</" + t + ">", (0, D.ib)(e.wysiwyg.element, n), O(e))
            }, ne = function (e) {
                var t = getSelection().getRangeAt(0), n = (0, y.F9)(t.startContainer);
                n || (n = t.startContainer.childNodes[t.startOffset]), n && (t.insertNode(document.createElement("wbr")), n.outerHTML = '<p data-block="0">' + n.innerHTML + "</p>", (0, D.ib)(e.wysiwyg.element, t)), e.wysiwyg.popover.style.display = "none"
            }, re = function (e, t, n) {
                void 0 === n && (n = !0);
                var r = e.previousElementSibling, i = r.ownerDocument.createRange();
                "CODE" === r.tagName ? (r.style.display = "inline-block", n ? i.setStart(r.firstChild, 1) : i.selectNodeContents(r)) : (r.style.display = "block", r.firstChild.firstChild || r.firstChild.appendChild(document.createTextNode("")), i.selectNodeContents(r.firstChild)), n ? i.collapse(!0) : i.collapse(!1), (0, D.Hc)(i), e.firstElementChild.classList.contains("language-mindmap") || Ae(t)
            }, ie = function (e, t) {
                if (P("⇧⌘X", t)) {
                    var n = e.wysiwyg.popover.querySelector('[data-type="remove"]');
                    return n && n.click(), t.preventDefault(), !0
                }
            }, oe = function (e) {
                clearTimeout(e.wysiwyg.hlToolbarTimeoutId), e.wysiwyg.hlToolbarTimeoutId = window.setTimeout((function () {
                    if ("false" !== e.wysiwyg.element.getAttribute("contenteditable") && (0, D.Gb)(e.wysiwyg.element)) {
                        c(e.toolbar.elements, i.g.EDIT_TOOLBARS), p(e.toolbar.elements, i.g.EDIT_TOOLBARS);
                        var t = getSelection().getRangeAt(0), n = t.startContainer;
                        n = 3 === t.startContainer.nodeType ? t.startContainer.parentElement : n.childNodes[t.startOffset >= n.childNodes.length ? n.childNodes.length - 1 : t.startOffset];
                        var r = (0, y.a1)(n, "data-type", "footnotes-block");
                        if (r) return e.wysiwyg.popover.innerHTML = "", ce(r, e), void ae(e, r);
                        var o = (0, y.lG)(n, "LI");
                        o ? (o.classList.contains("vditor-task") ? u(e.toolbar.elements, ["check"]) : "OL" === o.parentElement.tagName ? u(e.toolbar.elements, ["ordered-list"]) : "UL" === o.parentElement.tagName && u(e.toolbar.elements, ["list"]), p(e.toolbar.elements, ["outdent", "indent"])) : m(e.toolbar.elements, ["outdent", "indent"]), (0, y.lG)(n, "BLOCKQUOTE") && u(e.toolbar.elements, ["quote"]), ((0, y.lG)(n, "B") || (0, y.lG)(n, "STRONG")) && u(e.toolbar.elements, ["bold"]), ((0, y.lG)(n, "I") || (0, y.lG)(n, "EM")) && u(e.toolbar.elements, ["italic"]), ((0, y.lG)(n, "STRIKE") || (0, y.lG)(n, "S")) && u(e.toolbar.elements, ["strike"]), e.wysiwyg.element.querySelectorAll(".vditor-comment--focus").forEach((function (e) {
                            e.classList.remove("vditor-comment--focus")
                        }));
                        var a = (0, y.fb)(n, "vditor-comment");
                        if (a) {
                            var l = a.getAttribute("data-cmtids").split(" ");
                            if (l.length > 1 && a.nextSibling.isSameNode(a.nextElementSibling)) {
                                var s = a.nextElementSibling.getAttribute("data-cmtids").split(" ");
                                l.find((function (e) {
                                    if (s.includes(e)) return l = [e], !0
                                }))
                            }
                            e.wysiwyg.element.querySelectorAll(".vditor-comment").forEach((function (e) {
                                e.getAttribute("data-cmtids").indexOf(l[0]) > -1 && e.classList.add("vditor-comment--focus")
                            }))
                        }
                        var f = (0, y.lG)(n, "A");
                        f && u(e.toolbar.elements, ["link"]);
                        var h = (0, y.lG)(n, "TABLE"), v = (0, b.W)(n);
                        (0, y.lG)(n, "CODE") ? (0, y.lG)(n, "PRE") ? (m(e.toolbar.elements, ["headings", "bold", "italic", "strike", "line", "quote", "list", "ordered-list", "check", "code", "inline-code", "upload", "link", "table", "record"]), u(e.toolbar.elements, ["code"])) : (m(e.toolbar.elements, ["headings", "bold", "italic", "strike", "line", "quote", "list", "ordered-list", "check", "code", "upload", "link", "table", "record"]), u(e.toolbar.elements, ["inline-code"])) : v ? (m(e.toolbar.elements, ["bold"]), u(e.toolbar.elements, ["headings"])) : h && m(e.toolbar.elements, ["table"]);
                        var g = (0, y.fb)(n, "vditor-toc");
                        if (g) return e.wysiwyg.popover.innerHTML = "", ce(g, e), void ae(e, g);
                        var w = (0, b.S)(n, "BLOCKQUOTE");
                        if (w && (e.wysiwyg.popover.innerHTML = "", se(t, w, e), de(t, w, e), ce(w, e), ae(e, w)), o && (e.wysiwyg.popover.innerHTML = "", se(t, o, e), de(t, o, e), ce(o, e), ae(e, o)), h) {
                            e.options.lang, e.options;
                            e.wysiwyg.popover.innerHTML = "";
                            var E = function () {
                                var e = h.rows.length, t = h.rows[0].cells.length, n = parseInt(R.value, 10) || e,
                                    r = parseInt(q.value, 10) || t;
                                if (n !== e || t !== r) {
                                    if (t !== r) for (var i = r - t, o = 0; o < h.rows.length; o++) if (i > 0) for (var a = 0; a < i; a++) 0 === o ? h.rows[o].lastElementChild.insertAdjacentHTML("afterend", "<th> </th>") : h.rows[o].lastElementChild.insertAdjacentHTML("afterend", "<td> </td>"); else for (var l = t - 1; l >= r; l--) h.rows[o].cells[l].remove();
                                    if (e !== n) {
                                        var s = n - e;
                                        if (s > 0) {
                                            for (var d = "<tr>", c = 0; c < r; c++) d += "<td> </td>";
                                            for (var u = 0; u < s; u++) h.querySelector("tbody") ? h.querySelector("tbody").insertAdjacentHTML("beforeend", d) : h.querySelector("thead").insertAdjacentHTML("afterend", d + "</tr>")
                                        } else for (c = e - 1; c >= n; c--) h.rows[c].remove(), 1 === h.rows.length && h.querySelector("tbody").remove()
                                    }
                                }
                            }, k = function (n) {
                                at(h, n), "right" === n ? (T.classList.remove("vditor-icon--current"), M.classList.remove("vditor-icon--current"), A.classList.add("vditor-icon--current")) : "center" === n ? (T.classList.remove("vditor-icon--current"), A.classList.remove("vditor-icon--current"), M.classList.add("vditor-icon--current")) : (M.classList.remove("vditor-icon--current"), A.classList.remove("vditor-icon--current"), T.classList.add("vditor-icon--current")), (0, D.Hc)(t), Y(e)
                            }, S = (0, y.lG)(n, "TD"), L = (0, y.lG)(n, "TH"), C = "left";
                            S ? C = S.getAttribute("align") || "left" : L && (C = L.getAttribute("align") || "center");
                            var T = document.createElement("button");
                            T.setAttribute("type", "button"), T.setAttribute("aria-label", window.VditorI18n.alignLeft + "<" + (0, d.ns)("⇧⌘L") + ">"), T.setAttribute("data-type", "left"), T.innerHTML = '<svg><use xlink:href="#vditor-icon-align-left"></use></svg>', T.className = "vditor-icon vditor-tooltipped vditor-tooltipped__n" + ("left" === C ? " vditor-icon--current" : ""), T.onclick = function () {
                                k("left")
                            };
                            var M = document.createElement("button");
                            M.setAttribute("type", "button"), M.setAttribute("aria-label", window.VditorI18n.alignCenter + "<" + (0, d.ns)("⇧⌘C") + ">"), M.setAttribute("data-type", "center"), M.innerHTML = '<svg><use xlink:href="#vditor-icon-align-center"></use></svg>', M.className = "vditor-icon vditor-tooltipped vditor-tooltipped__n" + ("center" === C ? " vditor-icon--current" : ""), M.onclick = function () {
                                k("center")
                            };
                            var A = document.createElement("button");
                            A.setAttribute("type", "button"), A.setAttribute("aria-label", window.VditorI18n.alignRight + "<" + (0, d.ns)("⇧⌘R") + ">"), A.setAttribute("data-type", "right"), A.innerHTML = '<svg><use xlink:href="#vditor-icon-align-right"></use></svg>', A.className = "vditor-icon vditor-tooltipped vditor-tooltipped__n" + ("right" === C ? " vditor-icon--current" : ""), A.onclick = function () {
                                k("right")
                            };
                            var _ = document.createElement("button");
                            _.setAttribute("type", "button"), _.setAttribute("aria-label", window.VditorI18n.insertRowBelow + "<" + (0, d.ns)("⌘=") + ">"), _.setAttribute("data-type", "insertRow"), _.innerHTML = '<svg><use xlink:href="#vditor-icon-insert-row"></use></svg>', _.className = "vditor-icon vditor-tooltipped vditor-tooltipped__n", _.onclick = function () {
                                var n = getSelection().getRangeAt(0).startContainer,
                                    r = (0, y.lG)(n, "TD") || (0, y.lG)(n, "TH");
                                r && mt(e, t, r)
                            };
                            var x = document.createElement("button");
                            x.setAttribute("type", "button"), x.setAttribute("aria-label", window.VditorI18n.insertRowAbove + "<" + (0, d.ns)("⇧⌘F") + ">"), x.setAttribute("data-type", "insertRow"), x.innerHTML = '<svg><use xlink:href="#vditor-icon-insert-rowb"></use></svg>', x.className = "vditor-icon vditor-tooltipped vditor-tooltipped__n", x.onclick = function () {
                                var n = getSelection().getRangeAt(0).startContainer,
                                    r = (0, y.lG)(n, "TD") || (0, y.lG)(n, "TH");
                                r && ft(e, t, r)
                            };
                            var H = document.createElement("button");
                            H.setAttribute("type", "button"), H.setAttribute("aria-label", window.VditorI18n.insertColumnRight + "<" + (0, d.ns)("⇧⌘=") + ">"), H.setAttribute("data-type", "insertColumn"), H.innerHTML = '<svg><use xlink:href="#vditor-icon-insert-column"></use></svg>', H.className = "vditor-icon vditor-tooltipped vditor-tooltipped__n", H.onclick = function () {
                                var t = getSelection().getRangeAt(0).startContainer,
                                    n = (0, y.lG)(t, "TD") || (0, y.lG)(t, "TH");
                                n && ht(e, h, n)
                            };
                            var O = document.createElement("button");
                            O.setAttribute("type", "button"), O.setAttribute("aria-label", window.VditorI18n.insertColumnLeft + "<" + (0, d.ns)("⇧⌘G") + ">"), O.setAttribute("data-type", "insertColumn"), O.innerHTML = '<svg><use xlink:href="#vditor-icon-insert-columnb"></use></svg>', O.className = "vditor-icon vditor-tooltipped vditor-tooltipped__n", O.onclick = function () {
                                var t = getSelection().getRangeAt(0).startContainer,
                                    n = (0, y.lG)(t, "TD") || (0, y.lG)(t, "TH");
                                n && ht(e, h, n, "beforebegin")
                            };
                            var I = document.createElement("button");
                            I.setAttribute("type", "button"), I.setAttribute("aria-label", window.VditorI18n["delete-row"] + "<" + (0, d.ns)("⌘-") + ">"), I.setAttribute("data-type", "deleteRow"), I.innerHTML = '<svg><use xlink:href="#vditor-icon-delete-row"></use></svg>', I.className = "vditor-icon vditor-tooltipped vditor-tooltipped__n", I.onclick = function () {
                                var n = getSelection().getRangeAt(0).startContainer,
                                    r = (0, y.lG)(n, "TD") || (0, y.lG)(n, "TH");
                                r && vt(e, t, r)
                            };
                            var j = document.createElement("button");
                            j.setAttribute("type", "button"), j.setAttribute("aria-label", window.VditorI18n["delete-column"] + "<" + (0, d.ns)("⇧⌘-") + ">"), j.setAttribute("data-type", "deleteColumn"), j.innerHTML = '<svg><use xlink:href="#vditor-icon-delete-column"></use></svg>', j.className = "vditor-icon vditor-tooltipped vditor-tooltipped__n", j.onclick = function () {
                                var n = getSelection().getRangeAt(0).startContainer,
                                    r = (0, y.lG)(n, "TD") || (0, y.lG)(n, "TH");
                                r && gt(e, t, h, r)
                            }, (Z = document.createElement("span")).setAttribute("aria-label", window.VditorI18n.row), Z.className = "vditor-tooltipped vditor-tooltipped__n";
                            var R = document.createElement("input");
                            Z.appendChild(R), R.type = "number", R.min = "1", R.className = "vditor-input", R.style.width = "42px", R.style.textAlign = "center", R.setAttribute("placeholder", window.VditorI18n.row), R.value = h.rows.length.toString(), R.oninput = function () {
                                E()
                            }, R.onkeydown = function (n) {
                                if (!n.isComposing) return "Tab" === n.key ? (q.focus(), q.select(), void n.preventDefault()) : void (ie(e, n) || me(n, t))
                            };
                            var P = document.createElement("span");
                            P.setAttribute("aria-label", window.VditorI18n.column), P.className = "vditor-tooltipped vditor-tooltipped__n";
                            var q = document.createElement("input");
                            P.appendChild(q), q.type = "number", q.min = "1", q.className = "vditor-input", q.style.width = "42px", q.style.textAlign = "center", q.setAttribute("placeholder", window.VditorI18n.column), q.value = h.rows[0].cells.length.toString(), q.oninput = function () {
                                E()
                            }, q.onkeydown = function (n) {
                                if (!n.isComposing) return "Tab" === n.key ? (R.focus(), R.select(), void n.preventDefault()) : void (ie(e, n) || me(n, t))
                            }, se(t, h, e), de(t, h, e), ce(h, e), e.wysiwyg.popover.insertAdjacentElement("beforeend", T), e.wysiwyg.popover.insertAdjacentElement("beforeend", M), e.wysiwyg.popover.insertAdjacentElement("beforeend", A), e.wysiwyg.popover.insertAdjacentElement("beforeend", x), e.wysiwyg.popover.insertAdjacentElement("beforeend", _), e.wysiwyg.popover.insertAdjacentElement("beforeend", O), e.wysiwyg.popover.insertAdjacentElement("beforeend", H), e.wysiwyg.popover.insertAdjacentElement("beforeend", I), e.wysiwyg.popover.insertAdjacentElement("beforeend", j), e.wysiwyg.popover.insertAdjacentElement("beforeend", Z), e.wysiwyg.popover.insertAdjacentHTML("beforeend", " x "), e.wysiwyg.popover.insertAdjacentElement("beforeend", P), ae(e, h)
                        }
                        var B = (0, y.a1)(n, "data-type", "link-ref");
                        B && le(e, B, t);
                        var V = (0, y.a1)(n, "data-type", "footnotes-ref");
                        if (V) {
                            e.options.lang, e.options;
                            e.wysiwyg.popover.innerHTML = "", (Z = document.createElement("span")).setAttribute("aria-label", window.VditorI18n.footnoteRef + "<" + (0, d.ns)("⌥Enter") + ">"), Z.className = "vditor-tooltipped vditor-tooltipped__n";
                            var U = document.createElement("input");
                            Z.appendChild(U), U.className = "vditor-input", U.setAttribute("placeholder", window.VditorI18n.footnoteRef + "<" + (0, d.ns)("⌥Enter") + ">"), U.style.width = "120px", U.value = V.getAttribute("data-footnotes-label"), U.oninput = function () {
                                "" !== U.value.trim() && V.setAttribute("data-footnotes-label", U.value)
                            }, U.onkeydown = function (n) {
                                n.isComposing || ie(e, n) || me(n, t)
                            }, ce(V, e), e.wysiwyg.popover.insertAdjacentElement("beforeend", Z), ae(e, V)
                        }
                        var W = (0, y.fb)(n, "vditor-wysiwyg__block"),
                            z = !!W && W.getAttribute("data-type").indexOf("block") > -1;
                        if (e.wysiwyg.element.querySelectorAll(".vditor-wysiwyg__preview").forEach((function (e) {
                            (!W || W && z && !W.contains(e)) && (e.previousElementSibling.style.display = "none")
                        })), W && z) {
                            if (e.wysiwyg.popover.innerHTML = "", se(t, W, e), de(t, W, e), ce(W, e), "code-block" === W.getAttribute("data-type")) {
                                var G = document.createElement("span");
                                G.setAttribute("aria-label", window.VditorI18n.language + "<" + (0, d.ns)("⌥Enter") + ">"), G.className = "vditor-tooltipped vditor-tooltipped__n";
                                var K = document.createElement("input");
                                G.appendChild(K);
                                var F = W.firstElementChild.firstElementChild;
                                K.className = "vditor-input", K.setAttribute("placeholder", window.VditorI18n.language + "<" + (0, d.ns)("⌥Enter") + ">"), K.value = F.className.indexOf("language-") > -1 ? F.className.split("-")[1].split(" ")[0] : "", K.oninput = function (n) {
                                    "" !== K.value.trim() ? F.className = "language-" + K.value : (F.className = "", e.hint.recentLanguage = ""), W.lastElementChild.classList.contains("vditor-wysiwyg__preview") && (W.lastElementChild.innerHTML = W.firstElementChild.innerHTML, N(W.lastElementChild, e)), Y(e), 1 === n.detail && (t.setStart(F.firstChild, 0), t.collapse(!0), (0, D.Hc)(t))
                                }, K.onkeydown = function (n) {
                                    if (!n.isComposing && !ie(e, n)) {
                                        if ("Escape" === n.key && "block" === e.hint.element.style.display) return e.hint.element.style.display = "none", void n.preventDefault();
                                        e.hint.select(n, e), me(n, t)
                                    }
                                }, K.onkeyup = function (t) {
                                    if (!t.isComposing && "Enter" !== t.key && "ArrowUp" !== t.key && "Escape" !== t.key && "ArrowDown" !== t.key) {
                                        var n = [], r = K.value.substring(0, K.selectionStart);
                                        i.g.CODE_LANGUAGES.forEach((function (e) {
                                            e.indexOf(r.toLowerCase()) > -1 && n.push({html: e, value: e})
                                        })), e.hint.genHTML(n, r, e), t.preventDefault()
                                    }
                                }, e.wysiwyg.popover.insertAdjacentElement("beforeend", G)
                            }
                            ae(e, W)
                        } else W = void 0;
                        if (v) {
                            var Z;
                            e.wysiwyg.popover.innerHTML = "", (Z = document.createElement("span")).setAttribute("aria-label", "ID<" + (0, d.ns)("⌥Enter") + ">"), Z.className = "vditor-tooltipped vditor-tooltipped__n";
                            var J = document.createElement("input");
                            Z.appendChild(J), J.className = "vditor-input", J.setAttribute("placeholder", "ID<" + (0, d.ns)("⌥Enter") + ">"), J.style.width = "120px", J.value = v.getAttribute("data-id") || "", J.oninput = function () {
                                v.setAttribute("data-id", J.value)
                            }, J.onkeydown = function (n) {
                                n.isComposing || ie(e, n) || me(n, t)
                            }, se(t, v, e), de(t, v, e), ce(v, e), e.wysiwyg.popover.insertAdjacentElement("beforeend", Z), ae(e, v)
                        }
                        if (f && pe(e, f, t), !(w || o || h || W || f || B || V || v || g)) {
                            var X = (0, y.a1)(n, "data-block", "0");
                            X && X.parentElement.isEqualNode(e.wysiwyg.element) ? (e.wysiwyg.popover.innerHTML = "", se(t, X, e), de(t, X, e), ce(X, e), ae(e, X)) : e.wysiwyg.popover.style.display = "none"
                        }
                        e.wysiwyg.element.querySelectorAll('span[data-type="backslash"] > span').forEach((function (e) {
                            e.style.display = "none"
                        }));
                        var Q = (0, y.a1)(t.startContainer, "data-type", "backslash");
                        Q && (Q.querySelector("span").style.display = "inline")
                    }
                }), 200)
            }, ae = function (e, t) {
                var n = t, r = (0, y.lG)(t, "TABLE");
                r && (n = r), e.wysiwyg.popover.style.left = "0", e.wysiwyg.popover.style.display = "block", e.wysiwyg.popover.style.top = Math.max(-8, n.offsetTop - 21 - e.wysiwyg.element.scrollTop) + "px", e.wysiwyg.popover.style.left = Math.min(n.offsetLeft, e.wysiwyg.element.clientWidth - e.wysiwyg.popover.clientWidth) + "px", e.wysiwyg.popover.setAttribute("data-top", (n.offsetTop - 21).toString())
            }, le = function (e, t, n) {
                void 0 === n && (n = getSelection().getRangeAt(0)), e.wysiwyg.popover.innerHTML = "";
                var r = function () {
                    "" !== o.value.trim() && ("IMG" === t.tagName ? t.setAttribute("alt", o.value) : t.textContent = o.value), "" !== l.value.trim() && t.setAttribute("data-link-label", l.value)
                }, i = document.createElement("span");
                i.setAttribute("aria-label", window.VditorI18n.textIsNotEmpty), i.className = "vditor-tooltipped vditor-tooltipped__n";
                var o = document.createElement("input");
                i.appendChild(o), o.className = "vditor-input", o.setAttribute("placeholder", window.VditorI18n.textIsNotEmpty), o.style.width = "120px", o.value = t.getAttribute("alt") || t.textContent, o.oninput = function () {
                    r()
                }, o.onkeydown = function (r) {
                    ie(e, r) || me(r, n) || ue(e, t, r, l)
                };
                var a = document.createElement("span");
                a.setAttribute("aria-label", window.VditorI18n.linkRef), a.className = "vditor-tooltipped vditor-tooltipped__n";
                var l = document.createElement("input");
                a.appendChild(l), l.className = "vditor-input", l.setAttribute("placeholder", window.VditorI18n.linkRef), l.value = t.getAttribute("data-link-label"), l.oninput = function () {
                    r()
                }, l.onkeydown = function (r) {
                    ie(e, r) || me(r, n) || ue(e, t, r, o)
                }, ce(t, e), e.wysiwyg.popover.insertAdjacentElement("beforeend", i), e.wysiwyg.popover.insertAdjacentElement("beforeend", a), ae(e, t)
            }, se = function (e, t, n) {
                var r = t.previousElementSibling;
                if (r && (t.parentElement.isEqualNode(n.wysiwyg.element) || "LI" === t.tagName)) {
                    var i = document.createElement("button");
                    i.setAttribute("type", "button"), i.setAttribute("data-type", "up"), i.setAttribute("aria-label", window.VditorI18n.up + "<" + (0, d.ns)("⇧⌘U") + ">"), i.innerHTML = '<svg><use xlink:href="#vditor-icon-up"></use></svg>', i.className = "vditor-icon vditor-tooltipped vditor-tooltipped__n", i.onclick = function () {
                        e.insertNode(document.createElement("wbr")), r.insertAdjacentElement("beforebegin", t), (0, D.ib)(n.wysiwyg.element, e), Y(n), oe(n), Ae(n)
                    }, n.wysiwyg.popover.insertAdjacentElement("beforeend", i)
                }
            }, de = function (e, t, n) {
                var r = t.nextElementSibling;
                if (r && (t.parentElement.isEqualNode(n.wysiwyg.element) || "LI" === t.tagName)) {
                    var i = document.createElement("button");
                    i.setAttribute("type", "button"), i.setAttribute("data-type", "down"), i.setAttribute("aria-label", window.VditorI18n.down + "<" + (0, d.ns)("⇧⌘D") + ">"), i.innerHTML = '<svg><use xlink:href="#vditor-icon-down"></use></svg>', i.className = "vditor-icon vditor-tooltipped vditor-tooltipped__n", i.onclick = function () {
                        e.insertNode(document.createElement("wbr")), r.insertAdjacentElement("afterend", t), (0, D.ib)(n.wysiwyg.element, e), Y(n), oe(n), Ae(n)
                    }, n.wysiwyg.popover.insertAdjacentElement("beforeend", i)
                }
            }, ce = function (e, t) {
                var n = document.createElement("button");
                n.setAttribute("type", "button"), n.setAttribute("data-type", "remove"), n.setAttribute("aria-label", window.VditorI18n.remove + "<" + (0, d.ns)("⇧⌘X") + ">"), n.innerHTML = '<svg><use xlink:href="#vditor-icon-trashcan"></use></svg>', n.className = "vditor-icon vditor-tooltipped vditor-tooltipped__n", n.onclick = function () {
                    var n = (0, D.zh)(t);
                    n.setStartAfter(e), (0, D.Hc)(n), e.remove(), Y(t), oe(t), ["H1", "H2", "H3", "H4", "H5", "H6"].includes(e.tagName) && O(t)
                }, t.wysiwyg.popover.insertAdjacentElement("beforeend", n)
            }, ue = function (e, t, n, r) {
                if (!n.isComposing) {
                    if ("Tab" === n.key) return r.focus(), r.select(), void n.preventDefault();
                    if (!(0, d.yl)(n) && !n.shiftKey && n.altKey && "Enter" === n.key) {
                        var o = (0, D.zh)(e);
                        t.insertAdjacentHTML("afterend", i.g.ZWSP), o.setStartAfter(t.nextSibling), o.collapse(!0), (0, D.Hc)(o), n.preventDefault()
                    }
                }
            }, pe = function (e, t, n) {
                e.wysiwyg.popover.innerHTML = "";
                var r = function () {
                    "" !== o.value.trim() && (t.innerHTML = o.value), t.setAttribute("href", l.value), t.setAttribute("title", d.value), Y(e)
                };
                t.querySelectorAll("[data-marker]").forEach((function (e) {
                    e.removeAttribute("data-marker")
                }));
                var i = document.createElement("span");
                i.setAttribute("aria-label", window.VditorI18n.textIsNotEmpty), i.className = "vditor-tooltipped vditor-tooltipped__n";
                var o = document.createElement("input");
                i.appendChild(o), o.className = "vditor-input", o.setAttribute("placeholder", window.VditorI18n.textIsNotEmpty), o.style.width = "120px", o.value = t.innerHTML || "", o.oninput = function () {
                    r()
                }, o.onkeydown = function (r) {
                    ie(e, r) || me(r, n) || ue(e, t, r, l)
                };
                var a = document.createElement("span");
                a.setAttribute("aria-label", window.VditorI18n.link), a.className = "vditor-tooltipped vditor-tooltipped__n";
                var l = document.createElement("input");
                a.appendChild(l), l.className = "vditor-input", l.setAttribute("placeholder", window.VditorI18n.link), l.value = t.getAttribute("href") || "", l.oninput = function () {
                    r()
                }, l.onkeydown = function (r) {
                    ie(e, r) || me(r, n) || ue(e, t, r, d)
                };
                var s = document.createElement("span");
                s.setAttribute("aria-label", window.VditorI18n.tooltipText), s.className = "vditor-tooltipped vditor-tooltipped__n";
                var d = document.createElement("input");
                s.appendChild(d), d.className = "vditor-input", d.setAttribute("placeholder", window.VditorI18n.tooltipText), d.style.width = "60px", d.value = t.getAttribute("title") || "", d.oninput = function () {
                    r()
                }, d.onkeydown = function (r) {
                    ie(e, r) || me(r, n) || ue(e, t, r, o)
                }, ce(t, e), e.wysiwyg.popover.insertAdjacentElement("beforeend", i), e.wysiwyg.popover.insertAdjacentElement("beforeend", a), e.wysiwyg.popover.insertAdjacentElement("beforeend", s), ae(e, t)
            }, me = function (e, t) {
                if (!(0, d.yl)(e) && !e.shiftKey && "Enter" === e.key || "Escape" === e.key) return t && (0, D.Hc)(t), e.preventDefault(), e.stopPropagation(), !0
            }, fe = function (e) {
                "wysiwyg" === e.currentMode ? oe(e) : "ir" === e.currentMode && X(e)
            }, he = function (e, t, n) {
                void 0 === n && (n = {enableAddUndoStack: !0, enableHint: !1, enableInput: !0});
                var r = e.wysiwyg.element;
                r.innerHTML = e.lute.Md2VditorDOM(t), r.querySelectorAll(".vditor-wysiwyg__preview[data-render='2']").forEach((function (t) {
                    N(t, e), t.previousElementSibling.setAttribute("style", "display:none")
                })), Y(e, n)
            }, ve = function (e, t, n) {
                for (var r = e.startContainer.parentElement, o = !1, a = "", l = "", s = function (e) {
                    var t = $(e.startContainer), n = Q(e.startContainer), r = e.startContainer.textContent,
                        o = e.startOffset, a = "", l = "";
                    return ("" !== r.substr(0, o) && r.substr(0, o) !== i.g.ZWSP || t) && (a = "" + t + r.substr(0, o)), ("" !== r.substr(o) && r.substr(o) !== i.g.ZWSP || n) && (l = "" + r.substr(o) + n), {
                        afterHTML: l,
                        beforeHTML: a
                    }
                }(e), d = s.beforeHTML, c = s.afterHTML; r && !o;) {
                    var u = r.tagName;
                    if ("STRIKE" === u && (u = "S"), "I" === u && (u = "EM"), "B" === u && (u = "STRONG"), "S" === u || "STRONG" === u || "EM" === u) {
                        var p = "", m = "", f = "";
                        "0" !== r.parentElement.getAttribute("data-block") && (m = $(r), f = Q(r)), (d || m) && (d = p = m + "<" + u + ">" + d + "</" + u + ">"), ("bold" === n && "STRONG" === u || "italic" === n && "EM" === u || "strikeThrough" === n && "S" === u) && (p += "" + a + i.g.ZWSP + "<wbr>" + l, o = !0), (c || f) && (p += c = "<" + u + ">" + c + "</" + u + ">" + f), "0" !== r.parentElement.getAttribute("data-block") ? (r = r.parentElement).innerHTML = p : (r.outerHTML = p, r = r.parentElement), a = "<" + u + ">" + a, l = "</" + u + ">" + l
                    } else o = !0
                }
                (0, D.ib)(t.wysiwyg.element, e)
            }, ge = function (e, t) {
                var n, r = this;
                this.element = document.createElement("div"), t.className && (n = this.element.classList).add.apply(n, t.className.split(" "));
                var o = t.hotkey ? " <" + (0, d.ns)(t.hotkey) + ">" : "";
                2 === t.level && (o = t.hotkey ? " &lt;" + (0, d.ns)(t.hotkey) + "&gt;" : "");
                var a = t.tip ? t.tip + o : "" + window.VditorI18n[t.name] + o,
                    l = "upload" === t.name ? "div" : "button";
                if (2 === t.level) this.element.innerHTML = "<" + l + ' data-type="' + t.name + '">' + a + "</" + l + ">"; else {
                    this.element.classList.add("vditor-toolbar__item");
                    var s = document.createElement(l);
                    s.setAttribute("data-type", t.name), s.className = "vditor-tooltipped vditor-tooltipped__" + t.tipPosition, s.setAttribute("aria-label", a), s.innerHTML = t.icon, this.element.appendChild(s)
                }
                t.prefix && this.element.children[0].addEventListener((0, d.Le)(), (function (n) {
                    n.preventDefault(), r.element.firstElementChild.classList.contains(i.g.CLASS_MENU_DISABLED) || ("wysiwyg" === e.currentMode ? function (e, t, n) {
                        if (!(e.wysiwyg.composingLock && n instanceof CustomEvent)) {
                            var r = !0, o = !0;
                            e.wysiwyg.element.querySelector("wbr") && e.wysiwyg.element.querySelector("wbr").remove();
                            var a = (0, D.zh)(e), l = t.getAttribute("data-type");
                            if (t.classList.contains("vditor-menu--current")) if ("strike" === l && (l = "strikeThrough"), "quote" === l) {
                                var s = (0, y.lG)(a.startContainer, "BLOCKQUOTE");
                                s || (s = a.startContainer.childNodes[a.startOffset]), s && (r = !1, t.classList.remove("vditor-menu--current"), a.insertNode(document.createElement("wbr")), s.outerHTML = "" === s.innerHTML.trim() ? '<p data-block="0">' + s.innerHTML + "</p>" : s.innerHTML, (0, D.ib)(e.wysiwyg.element, a))
                            } else if ("inline-code" === l) {
                                var d = (0, y.lG)(a.startContainer, "CODE");
                                d || (d = a.startContainer.childNodes[a.startOffset]), d && (d.outerHTML = d.innerHTML.replace(i.g.ZWSP, "") + "<wbr>", (0, D.ib)(e.wysiwyg.element, a))
                            } else "link" === l ? a.collapsed ? (a.selectNode(a.startContainer.parentElement), document.execCommand("unlink", !1, "")) : document.execCommand("unlink", !1, "") : "check" === l || "list" === l || "ordered-list" === l ? (rt(e, a, l), (0, D.ib)(e.wysiwyg.element, a), r = !1, t.classList.remove("vditor-menu--current")) : (r = !1, t.classList.remove("vditor-menu--current"), "" === a.toString() ? ve(a, e, l) : document.execCommand(l, !1, "")); else {
                                0 === e.wysiwyg.element.childNodes.length && (e.wysiwyg.element.innerHTML = '<p data-block="0"><wbr></p>', (0, D.ib)(e.wysiwyg.element, a));
                                var u = (0, y.F9)(a.startContainer);
                                if ("quote" === l) {
                                    if (u || (u = a.startContainer.childNodes[a.startOffset]), u) {
                                        r = !1, t.classList.add("vditor-menu--current"), a.insertNode(document.createElement("wbr"));
                                        var p = (0, y.lG)(a.startContainer, "LI");
                                        p && u.contains(p) ? p.innerHTML = '<blockquote data-block="0">' + p.innerHTML + "</blockquote>" : u.outerHTML = '<blockquote data-block="0">' + u.outerHTML + "</blockquote>", (0, D.ib)(e.wysiwyg.element, a)
                                    }
                                } else if ("check" === l || "list" === l || "ordered-list" === l) rt(e, a, l, !1), (0, D.ib)(e.wysiwyg.element, a), r = !1, c(e.toolbar.elements, ["check", "list", "ordered-list"]), t.classList.add("vditor-menu--current"); else if ("inline-code" === l) {
                                    if ("" === a.toString()) (m = document.createElement("code")).textContent = i.g.ZWSP, a.insertNode(m), a.setStart(m.firstChild, 1), a.collapse(!0), (0, D.Hc)(a); else if (3 === a.startContainer.nodeType) {
                                        var m = document.createElement("code");
                                        a.surroundContents(m), a.insertNode(m), (0, D.Hc)(a)
                                    }
                                    t.classList.add("vditor-menu--current")
                                } else if ("code" === l) (m = document.createElement("div")).className = "vditor-wysiwyg__block", m.setAttribute("data-type", "code-block"), m.setAttribute("data-block", "0"), m.setAttribute("data-marker", "```"), "" === a.toString() ? m.innerHTML = "<pre><code><wbr>\n</code></pre>" : (m.innerHTML = "<pre><code>" + a.toString() + "<wbr></code></pre>", a.deleteContents()), a.insertNode(m), u && (u.outerHTML = e.lute.SpinVditorDOM(u.outerHTML)), (0, D.ib)(e.wysiwyg.element, a), e.wysiwyg.element.querySelectorAll(".vditor-wysiwyg__preview[data-render='2']").forEach((function (t) {
                                    N(t, e)
                                })), t.classList.add("vditor-menu--disabled"); else if ("link" === l) {
                                    if ("" === a.toString()) {
                                        var f = document.createElement("a");
                                        f.innerText = i.g.ZWSP, a.insertNode(f), a.setStart(f.firstChild, 1), a.collapse(!0), pe(e, f, a);
                                        var h = e.wysiwyg.popover.querySelector("input");
                                        h.value = "", h.focus(), o = !1
                                    } else {
                                        (m = document.createElement("a")).setAttribute("href", ""), m.innerHTML = a.toString(), a.surroundContents(m), a.insertNode(m), (0, D.Hc)(a), pe(e, m, a);
                                        var v = e.wysiwyg.popover.querySelectorAll("input");
                                        v[0].value = m.innerText, v[1].focus()
                                    }
                                    r = !1, t.classList.add("vditor-menu--current")
                                } else if ("table" === l) {
                                    var g = '<table data-block="0"><thead><tr><th>col1<wbr></th><th>col2</th><th>col3</th></tr></thead><tbody><tr><td> </td><td> </td><td> </td></tr><tr><td> </td><td> </td><td> </td></tr></tbody></table>';
                                    if ("" === a.toString().trim()) u && "" === u.innerHTML.trim().replace(i.g.ZWSP, "") ? u.outerHTML = g : document.execCommand("insertHTML", !1, g), a.selectNode(e.wysiwyg.element.querySelector("wbr").previousSibling), e.wysiwyg.element.querySelector("wbr").remove(), (0, D.Hc)(a); else {
                                        g = '<table data-block="0"><thead><tr>';
                                        var b = a.toString().split("\n"),
                                            w = b[0].split(",").length > b[0].split("\t").length ? "," : "\t";
                                        b.forEach((function (e, t) {
                                            0 === t ? (e.split(w).forEach((function (e, t) {
                                                g += 0 === t ? "<th>" + e + "<wbr></th>" : "<th>" + e + "</th>"
                                            })), g += "</tr></thead>") : (g += 1 === t ? "<tbody><tr>" : "<tr>", e.split(w).forEach((function (e) {
                                                g += "<td>" + e + "</td>"
                                            })), g += "</tr>")
                                        })), g += "</tbody></table>", document.execCommand("insertHTML", !1, g), (0, D.ib)(e.wysiwyg.element, a)
                                    }
                                    r = !1, t.classList.add("vditor-menu--disabled")
                                } else if ("line" === l) {
                                    if (u) {
                                        var E = '<hr data-block="0"><p data-block="0"><wbr>\n</p>';
                                        "" === u.innerHTML.trim() ? u.outerHTML = E : u.insertAdjacentHTML("afterend", E), (0, D.ib)(e.wysiwyg.element, a)
                                    }
                                } else if (r = !1, t.classList.add("vditor-menu--current"), "strike" === l && (l = "strikeThrough"), "" !== a.toString() || "bold" !== l && "italic" !== l && "strikeThrough" !== l) document.execCommand(l, !1, ""); else {
                                    var k = "strong";
                                    "italic" === l ? k = "em" : "strikeThrough" === l && (k = "s"), (m = document.createElement(k)).textContent = i.g.ZWSP, a.insertNode(m), m.previousSibling && m.previousSibling.textContent === i.g.ZWSP && (m.previousSibling.textContent = ""), a.setStart(m.firstChild, 1), a.collapse(!0), (0, D.Hc)(a)
                                }
                            }
                            r && oe(e), o && Y(e)
                        }
                    }(e, r.element.children[0], n) : "ir" === e.currentMode ? xt(e, r.element.children[0], t.prefix || "", t.suffix || "") : Re(e, r.element.children[0], t.prefix || "", t.suffix || ""))
                }))
            }, ye = (F = function (e, t) {
                return F = Object.setPrototypeOf || {__proto__: []} instanceof Array && function (e, t) {
                    e.__proto__ = t
                } || function (e, t) {
                    for (var n in t) t.hasOwnProperty(n) && (e[n] = t[n])
                }, F(e, t)
            }, function (e, t) {
                function n() {
                    this.constructor = e
                }

                F(e, t), e.prototype = null === t ? Object.create(t) : (n.prototype = t.prototype, new n)
            }), be = function (e, t, n) {
                var r;
                if ("string" != typeof n ? (v(e, ["subToolbar", "hint"]), n.preventDefault(), r = a(e)) : r = n, e.currentMode !== t || "string" == typeof n) {
                    if (e.devtools && e.devtools.renderEchart(e), "both" === e.options.preview.mode && "sv" === t ? e.preview.element.style.display = "block" : e.preview.element.style.display = "none", p(e.toolbar.elements, i.g.EDIT_TOOLBARS), c(e.toolbar.elements, i.g.EDIT_TOOLBARS), m(e.toolbar.elements, ["outdent", "indent"]), "ir" === t) f(e.toolbar.elements, ["both"]), h(e.toolbar.elements, ["outdent", "indent", "outline", "insert-before", "insert-after"]), e.sv.element.style.display = "none", e.wysiwyg.element.parentElement.style.display = "none", e.ir.element.parentElement.style.display = "block", e.lute.SetVditorIR(!0), e.lute.SetVditorWYSIWYG(!1), e.lute.SetVditorSV(!1), e.currentMode = "ir", e.ir.element.innerHTML = e.lute.Md2VditorIRDOM(r), Mt(e, {
                        enableAddUndoStack: !0,
                        enableHint: !1,
                        enableInput: !1
                    }), z(e), e.ir.element.querySelectorAll(".vditor-ir__preview[data-render='2']").forEach((function (t) {
                        N(t, e)
                    })), e.ir.element.querySelectorAll(".vditor-toc").forEach((function (t) {
                        (0, M.H)(t, {cdn: e.options.cdn, math: e.options.preview.math})
                    })); else if ("wysiwyg" === t) f(e.toolbar.elements, ["both"]), h(e.toolbar.elements, ["outdent", "indent", "outline", "insert-before", "insert-after"]), e.sv.element.style.display = "none", e.wysiwyg.element.parentElement.style.display = "block", e.ir.element.parentElement.style.display = "none", e.lute.SetVditorIR(!1), e.lute.SetVditorWYSIWYG(!0), e.lute.SetVditorSV(!1), e.currentMode = "wysiwyg", z(e), he(e, r, {
                        enableAddUndoStack: !0,
                        enableHint: !1,
                        enableInput: !1
                    }), e.wysiwyg.element.querySelectorAll(".vditor-toc").forEach((function (t) {
                        (0, M.H)(t, {cdn: e.options.cdn, math: e.options.preview.math})
                    })), e.wysiwyg.popover.style.display = "none"; else if ("sv" === t) {
                        h(e.toolbar.elements, ["both"]), f(e.toolbar.elements, ["outdent", "indent", "outline", "insert-before", "insert-after"]), e.wysiwyg.element.parentElement.style.display = "none", e.ir.element.parentElement.style.display = "none", ("both" === e.options.preview.mode || "editor" === e.options.preview.mode) && (e.sv.element.style.display = "block"), e.lute.SetVditorIR(!1), e.lute.SetVditorWYSIWYG(!1), e.lute.SetVditorSV(!0), e.currentMode = "sv";
                        var o = De(r, e);
                        "<div data-block='0'></div>" === o && (o = ""), e.sv.element.innerHTML = o, Ie(e, {
                            enableAddUndoStack: !0,
                            enableHint: !1,
                            enableInput: !1
                        }), z(e)
                    }
                    e.undo.resetIcon(e), "string" != typeof n && (e[e.currentMode].element.focus(), fe(e)), O(e), G(e), e.toolbar.elements["edit-mode"] && (e.toolbar.elements["edit-mode"].querySelectorAll("button").forEach((function (e) {
                        e.classList.remove("vditor-menu--current")
                    })), e.toolbar.elements["edit-mode"].querySelector('button[data-mode="' + e.currentMode + '"]').classList.add("vditor-menu--current")), e.outline.toggle(e, "sv" !== e.currentMode && e.options.outline.enable, "string" != typeof n)
                }
            }, we = function (e) {
                function t(t, n) {
                    var r = e.call(this, t, n) || this, i = document.createElement("div");
                    return i.className = "vditor-hint" + (2 === n.level ? "" : " vditor-panel--arrow"), i.innerHTML = '<button data-mode="wysiwyg">' + window.VditorI18n.wysiwyg + " &lt;" + (0, d.ns)("⌥⌘7") + '></button>\n<button data-mode="ir">' + window.VditorI18n.instantRendering + " &lt;" + (0, d.ns)("⌥⌘8") + '></button>\n<button data-mode="sv">' + window.VditorI18n.splitView + " &lt;" + (0, d.ns)("⌥⌘9") + "></button>", r.element.appendChild(i), r._bindEvent(t, i, n), r
                }

                return ye(t, e), t.prototype._bindEvent = function (e, t, n) {
                    var r = this.element.children[0];
                    g(e, t, r, n.level), t.children.item(0).addEventListener((0, d.Le)(), (function (t) {
                        be(e, "wysiwyg", t), t.preventDefault(), t.stopPropagation()
                    })), t.children.item(1).addEventListener((0, d.Le)(), (function (t) {
                        be(e, "ir", t), t.preventDefault(), t.stopPropagation()
                    })), t.children.item(2).addEventListener((0, d.Le)(), (function (t) {
                        be(e, "sv", t), t.preventDefault(), t.stopPropagation()
                    }))
                }, t
            }(ge), Ee = function (e, t) {
                return (0, D.Gb)(e, t) ? getSelection().toString() : ""
            }, ke = function (e, t) {
                t.addEventListener("focus", (function () {
                    e.options.focus && e.options.focus(a(e)), v(e, ["subToolbar", "hint"])
                }))
            }, Se = function (e, t) {
                t.addEventListener("dblclick", (function (t) {
                    "IMG" === t.target.tagName && (e.options.image.preview ? e.options.image.preview(t.target) : e.options.image.isPreview && (0, B.E)(t.target, e.options.lang, e.options.theme))
                }))
            }, Le = function (e, t) {
                t.addEventListener("blur", (function (t) {
                    if ("ir" === e.currentMode) {
                        var n = e.ir.element.querySelector(".vditor-ir__node--expand");
                        n && n.classList.remove("vditor-ir__node--expand")
                    } else "wysiwyg" !== e.currentMode || e.wysiwyg.selectPopover.contains(t.relatedTarget) || e.wysiwyg.hideComment();
                    e[e.currentMode].range = (0, D.zh)(e), e.options.blur && e.options.blur(a(e))
                }))
            }, Ce = function (e, t) {
                t.addEventListener("dragstart", (function (e) {
                    e.dataTransfer.setData(i.g.DROP_EDITOR, i.g.DROP_EDITOR)
                })), t.addEventListener("drop", (function (t) {
                    t.dataTransfer.getData(i.g.DROP_EDITOR) ? dt(e) : (t.dataTransfer.types.includes("Files") || t.dataTransfer.types.includes("text/html")) && Ct(e, t, {
                        pasteCode: function (e) {
                            document.execCommand("insertHTML", !1, e)
                        }
                    })
                }))
            }, Te = function (e, t, n) {
                t.addEventListener("copy", (function (t) {
                    return n(t, e)
                }))
            }, Me = function (e, t, n) {
                t.addEventListener("cut", (function (t) {
                    n(t, e), e.options.comment.enable && "wysiwyg" === e.currentMode && e.wysiwyg.getComments(e), document.execCommand("delete")
                }))
            }, Ae = function (e) {
                if ("wysiwyg" === e.currentMode && e.options.comment.enable && e.options.comment.adjustTop(e.wysiwyg.getComments(e, !0)), e.options.typewriterMode) {
                    var t = e[e.currentMode].element, n = (0, D.Ny)(t).top;
                    "auto" !== e.options.height || e.element.classList.contains("vditor--fullscreen") || window.scrollTo(window.scrollX, n + e.element.offsetTop + e.toolbar.element.offsetHeight - window.innerHeight / 2 + 10), ("auto" !== e.options.height || e.element.classList.contains("vditor--fullscreen")) && (t.scrollTop = n + t.scrollTop - t.clientHeight / 2 + 10)
                }
            }, _e = function (e, t) {
                t.addEventListener("keydown", (function (t) {
                    if (!t.isComposing && e.options.keydown && e.options.keydown(t), !(e.options.hint.extend.length > 1 || e.toolbar.elements.emoji) || !e.hint.select(t, e)) {
                        if (e.options.comment.enable && "wysiwyg" === e.currentMode && ("Backspace" === t.key || P("⌘X", t)) && e.wysiwyg.getComments(e), "sv" === e.currentMode) {
                            if (function (e, t) {
                                var n, r, i, o, a;
                                if (e.sv.composingLock = t.isComposing, t.isComposing) return !1;
                                if (-1 !== t.key.indexOf("Arrow") || "Meta" === t.key || "Control" === t.key || "Alt" === t.key || "Shift" === t.key || "CapsLock" === t.key || "Escape" === t.key || /^F\d{1,2}$/.test(t.key) || e.undo.recordFirstPosition(e, t), "Enter" !== t.key && "Tab" !== t.key && "Backspace" !== t.key && -1 === t.key.indexOf("Arrow") && !(0, d.yl)(t) && "Escape" !== t.key) return !1;
                                var l = (0, D.zh)(e), s = l.startContainer;
                                3 !== l.startContainer.nodeType && "DIV" === l.startContainer.tagName && (s = l.startContainer.childNodes[l.startOffset - 1]);
                                var c = (0, y.a1)(s, "data-type", "text"),
                                    u = (0, y.a1)(s, "data-type", "blockquote-marker");
                                if (!u && 0 === l.startOffset && c && c.previousElementSibling && "blockquote-marker" === c.previousElementSibling.getAttribute("data-type") && (u = c.previousElementSibling), u && "Enter" === t.key && !(0, d.yl)(t) && !t.altKey && "" === u.nextElementSibling.textContent.trim() && (0, D.im)(u, e.sv.element, l).start === u.textContent.length) return "padding" === (null === (n = u.previousElementSibling) || void 0 === n ? void 0 : n.getAttribute("data-type")) && u.previousElementSibling.setAttribute("data-action", "enter-remove"), u.remove(), Ie(e), t.preventDefault(), !0;
                                var p = (0, y.a1)(s, "data-type", "li-marker"),
                                    m = (0, y.a1)(s, "data-type", "task-marker"), f = p;
                                if (f || m && "task-marker" !== m.nextElementSibling.getAttribute("data-type") && (f = m), f || 0 !== l.startOffset || !c || !c.previousElementSibling || "li-marker" !== c.previousElementSibling.getAttribute("data-type") && "task-marker" !== c.previousElementSibling.getAttribute("data-type") || (f = c.previousElementSibling), f) {
                                    var h = (0, D.im)(f, e.sv.element, l).start,
                                        v = "task-marker" === f.getAttribute("data-type"), g = f;
                                    if (v && (g = f.previousElementSibling.previousElementSibling.previousElementSibling), h === f.textContent.length) {
                                        if ("Enter" === t.key && !(0, d.yl)(t) && !t.altKey && !t.shiftKey && "" === f.nextElementSibling.textContent.trim()) return "padding" === (null === (r = g.previousElementSibling) || void 0 === r ? void 0 : r.getAttribute("data-type")) ? (g.previousElementSibling.remove(), V(e)) : (v && (g.remove(), f.previousElementSibling.previousElementSibling.remove(), f.previousElementSibling.remove()), f.nextElementSibling.remove(), f.remove(), Ie(e)), t.preventDefault(), !0;
                                        if ("Tab" === t.key) return g.insertAdjacentHTML("beforebegin", '<span data-type="padding">' + g.textContent.replace(/\S/g, " ") + "</span>"), /^\d/.test(g.textContent) && (g.textContent = g.textContent.replace(/^\d{1,}/, "1"), l.selectNodeContents(f.firstChild), l.collapse(!1)), V(e), t.preventDefault(), !0
                                    }
                                }
                                if (ut(e, l, t)) return !0;
                                var w = (0, y.a1)(s, "data-block", "0"), E = (0, b.S)(s, "SPAN");
                                if ("Enter" === t.key && !(0, d.yl)(t) && !t.altKey && !t.shiftKey && w) {
                                    var k = !1, S = w.textContent.match(/^\n+/);
                                    (0, D.im)(w, e.sv.element).start <= (S ? S[0].length : 0) && (k = !0);
                                    var L = "\n";
                                    if (E) {
                                        if ("enter-remove" === (null === (i = E.previousElementSibling) || void 0 === i ? void 0 : i.getAttribute("data-action"))) return E.previousElementSibling.remove(), Ie(e), t.preventDefault(), !0;
                                        L += Oe(E)
                                    }
                                    return l.insertNode(document.createTextNode(L)), l.collapse(!1), w && "" !== w.textContent.trim() && !k ? V(e) : Ie(e), t.preventDefault(), !0
                                }
                                if ("Backspace" === t.key && !(0, d.yl)(t) && !t.altKey && !t.shiftKey) {
                                    if (E && "newline" === (null === (o = E.previousElementSibling) || void 0 === o ? void 0 : o.getAttribute("data-type")) && 1 === (0, D.im)(E, e.sv.element, l).start && -1 === E.getAttribute("data-type").indexOf("code-block-")) return l.setStart(E, 0), l.extractContents(), "" !== E.textContent.trim() ? V(e) : Ie(e), t.preventDefault(), !0;
                                    if (w && 0 === (0, D.im)(w, e.sv.element, l).start && w.previousElementSibling) {
                                        l.extractContents();
                                        var C = w.previousElementSibling.lastElementChild;
                                        return "newline" === C.getAttribute("data-type") && (C.remove(), C = w.previousElementSibling.lastElementChild), "newline" !== C.getAttribute("data-type") && (C.insertAdjacentHTML("afterend", w.innerHTML), w.remove()), "" === w.textContent.trim() || (null === (a = w.previousElementSibling) || void 0 === a ? void 0 : a.querySelector('[data-type="code-block-open-marker"]')) ? ("newline" !== C.getAttribute("data-type") && (l.selectNodeContents(C.lastChild), l.collapse(!1)), Ie(e)) : V(e), t.preventDefault(), !0
                                    }
                                }
                                return !1
                            }(e, t)) return
                        } else if ("wysiwyg" === e.currentMode) {
                            if (function (e, t) {
                                if (e.wysiwyg.composingLock = t.isComposing, t.isComposing) return !1;
                                -1 !== t.key.indexOf("Arrow") || "Meta" === t.key || "Control" === t.key || "Alt" === t.key || "Shift" === t.key || "CapsLock" === t.key || "Escape" === t.key || /^F\d{1,2}$/.test(t.key) || e.undo.recordFirstPosition(e, t);
                                var n = (0, D.zh)(e), r = n.startContainer;
                                if (!Ze(t, e, r)) return !1;
                                if (Je(n, e, t), St(n), "Enter" !== t.key && "Tab" !== t.key && "Backspace" !== t.key && -1 === t.key.indexOf("Arrow") && !(0, d.yl)(t) && "Escape" !== t.key && "Delete" !== t.key) return !1;
                                var o = (0, y.F9)(r), a = (0, y.lG)(r, "P");
                                if (pt(t, e, a, n)) return !0;
                                if (ct(n, e, a, t)) return !0;
                                if (yt(e, t, n)) return !0;
                                var l = (0, y.fb)(r, "vditor-wysiwyg__block");
                                if (l) {
                                    if ("Escape" === t.key && 2 === l.children.length) return e.wysiwyg.popover.style.display = "none", l.firstElementChild.style.display = "none", e.wysiwyg.element.blur(), t.preventDefault(), !0;
                                    if (!(0, d.yl)(t) && !t.shiftKey && t.altKey && "Enter" === t.key && "code-block" === l.getAttribute("data-type")) {
                                        var s = e.wysiwyg.popover.querySelector(".vditor-input");
                                        return s.focus(), s.select(), t.preventDefault(), !0
                                    }
                                    if ("0" === l.getAttribute("data-block")) {
                                        if (bt(e, t, l.firstElementChild, n)) return !0;
                                        if (tt(e, t, n, l.firstElementChild, l)) return !0;
                                        if ("yaml-front-matter" !== l.getAttribute("data-type") && nt(e, t, n, l.firstElementChild, l)) return !0
                                    }
                                }
                                if (wt(e, n, t, a)) return !0;
                                var c = (0, y.E2)(r, "BLOCKQUOTE");
                                if (c && !t.shiftKey && t.altKey && "Enter" === t.key) {
                                    (0, d.yl)(t) ? n.setStartBefore(c) : n.setStartAfter(c), (0, D.Hc)(n);
                                    var u = document.createElement("p");
                                    return u.setAttribute("data-block", "0"), u.innerHTML = "\n", n.insertNode(u), n.collapse(!0), (0, D.Hc)(n), Y(e), Ae(e), t.preventDefault(), !0
                                }
                                var p, m = (0, b.W)(r);
                                if (m) {
                                    if ("H6" === m.tagName && r.textContent.length === n.startOffset && !(0, d.yl)(t) && !t.shiftKey && !t.altKey && "Enter" === t.key) {
                                        var f = document.createElement("p");
                                        return f.textContent = "\n", f.setAttribute("data-block", "0"), r.parentElement.insertAdjacentElement("afterend", f), n.setStart(f, 0), (0, D.Hc)(n), Y(e), Ae(e), t.preventDefault(), !0
                                    }
                                    var h;
                                    if (P("⌘=", t)) return (h = parseInt(m.tagName.substr(1), 10) - 1) > 0 && (te(e, "h" + h), Y(e)), t.preventDefault(), !0;
                                    if (P("⌘-", t)) return (h = parseInt(m.tagName.substr(1), 10) + 1) < 7 && (te(e, "h" + h), Y(e)), t.preventDefault(), !0;
                                    "Backspace" !== t.key || (0, d.yl)(t) || t.shiftKey || t.altKey || 1 !== m.textContent.length || ne(e)
                                }
                                if (Et(e, n, t)) return !0;
                                if (t.altKey && "Enter" === t.key && !(0, d.yl)(t) && !t.shiftKey) {
                                    var v = (0, y.lG)(r, "A"), g = (0, y.a1)(r, "data-type", "link-ref"),
                                        w = (0, y.a1)(r, "data-type", "footnotes-ref");
                                    if (v || g || w || m && 2 === m.tagName.length) {
                                        var E = e.wysiwyg.popover.querySelector("input");
                                        E.focus(), E.select()
                                    }
                                }
                                if (ie(e, t)) return !0;
                                if (P("⇧⌘U", t) && (p = e.wysiwyg.popover.querySelector('[data-type="up"]'))) return p.click(), t.preventDefault(), !0;
                                if (P("⇧⌘D", t) && (p = e.wysiwyg.popover.querySelector('[data-type="down"]'))) return p.click(), t.preventDefault(), !0;
                                if (ut(e, n, t)) return !0;
                                if (!(0, d.yl)(t) && t.shiftKey && !t.altKey && "Enter" === t.key && "LI" !== r.parentElement.tagName && "P" !== r.parentElement.tagName) return ["STRONG", "STRIKE", "S", "I", "EM", "B"].includes(r.parentElement.tagName) ? n.insertNode(document.createTextNode("\n" + i.g.ZWSP)) : n.insertNode(document.createTextNode("\n")), n.collapse(!1), (0, D.Hc)(n), Y(e), Ae(e), t.preventDefault(), !0;
                                if ("Backspace" === t.key && !(0, d.yl)(t) && !t.shiftKey && !t.altKey && "" === n.toString()) {
                                    if (kt(e, n, t, a)) return !0;
                                    if (o) {
                                        if (o.previousElementSibling && o.previousElementSibling.classList.contains("vditor-wysiwyg__block") && "0" === o.previousElementSibling.getAttribute("data-block") && "UL" !== o.tagName && "OL" !== o.tagName) {
                                            var k = (0, D.im)(o, e.wysiwyg.element, n).start;
                                            if (0 === k && 0 === n.startOffset || 1 === k && o.innerText.startsWith(i.g.ZWSP)) return re(o.previousElementSibling.lastElementChild, e, !1), "" === o.innerHTML.trim().replace(i.g.ZWSP, "") && (o.remove(), Y(e)), t.preventDefault(), !0
                                        }
                                        var S = n.startOffset;
                                        if ("" === n.toString() && 3 === r.nodeType && "\n" === r.textContent.charAt(S - 2) && r.textContent.charAt(S - 1) !== i.g.ZWSP && ["STRONG", "STRIKE", "S", "I", "EM", "B"].includes(r.parentElement.tagName)) return r.textContent = r.textContent.substring(0, S - 1) + i.g.ZWSP, n.setStart(r, S), n.collapse(!0), Y(e), t.preventDefault(), !0;
                                        r.textContent === i.g.ZWSP && 1 === n.startOffset && !r.previousSibling && function (e) {
                                            for (var t = e.startContainer.nextSibling; t && "" === t.textContent;) t = t.nextSibling;
                                            return !(!t || 3 === t.nodeType || "CODE" !== t.tagName && "math-inline" !== t.getAttribute("data-type") && "html-entity" !== t.getAttribute("data-type") && "html-inline" !== t.getAttribute("data-type"))
                                        }(n) && (r.textContent = ""), o.querySelectorAll("span.vditor-wysiwyg__block[data-type='math-inline']").forEach((function (e) {
                                            e.firstElementChild.style.display = "inline", e.lastElementChild.style.display = "none"
                                        })), o.querySelectorAll("span.vditor-wysiwyg__block[data-type='html-entity']").forEach((function (e) {
                                            e.firstElementChild.style.display = "inline", e.lastElementChild.style.display = "none"
                                        }))
                                    }
                                }
                                if ((0, d.vU)() && 1 === n.startOffset && r.textContent.indexOf(i.g.ZWSP) > -1 && r.previousSibling && 3 !== r.previousSibling.nodeType && "CODE" === r.previousSibling.tagName && ("Backspace" === t.key || "ArrowLeft" === t.key)) return n.selectNodeContents(r.previousSibling), n.collapse(!1), t.preventDefault(), !0;
                                if (Lt(t, o, n)) return t.preventDefault(), !0;
                                if (Xe(n, t.key), "ArrowDown" === t.key) {
                                    var L = r.nextSibling;
                                    L && 3 !== L.nodeType && "math-inline" === L.getAttribute("data-type") && n.setStartAfter(L)
                                }
                                return !(!o || !j(o, e, t, n) || (t.preventDefault(), 0))
                            }(e, t)) return
                        } else if ("ir" === e.currentMode && function (e, t) {
                            if (e.ir.composingLock = t.isComposing, t.isComposing) return !1;
                            -1 !== t.key.indexOf("Arrow") || "Meta" === t.key || "Control" === t.key || "Alt" === t.key || "Shift" === t.key || "CapsLock" === t.key || "Escape" === t.key || /^F\d{1,2}$/.test(t.key) || e.undo.recordFirstPosition(e, t);
                            var n = (0, D.zh)(e), r = n.startContainer;
                            if (!Ze(t, e, r)) return !1;
                            if (Je(n, e, t), St(n), "Enter" !== t.key && "Tab" !== t.key && "Backspace" !== t.key && -1 === t.key.indexOf("Arrow") && !(0, d.yl)(t) && "Escape" !== t.key && "Delete" !== t.key) return !1;
                            var o = (0, y.a1)(r, "data-newline", "1");
                            if (!(0, d.yl)(t) && !t.altKey && !t.shiftKey && "Enter" === t.key && o && n.startOffset < o.textContent.length) {
                                var a = o.previousElementSibling;
                                a && (n.insertNode(document.createTextNode(a.textContent)), n.collapse(!1));
                                var l = o.nextSibling;
                                l && (n.insertNode(document.createTextNode(l.textContent)), n.collapse(!0))
                            }
                            var s = (0, y.lG)(r, "P");
                            if (pt(t, e, s, n)) return !0;
                            if (ct(n, e, s, t)) return !0;
                            if (wt(e, n, t, s)) return !0;
                            var c = (0, y.fb)(r, "vditor-ir__marker--pre");
                            if (c && "PRE" === c.tagName) {
                                var u = c.firstChild;
                                if (bt(e, t, c, n)) return !0;
                                if (("math-block" === u.getAttribute("data-type") || "html-block" === u.getAttribute("data-type")) && nt(e, t, n, u, c.parentElement)) return !0;
                                if (tt(e, t, n, u, c.parentElement)) return !0
                            }
                            var p = (0, y.a1)(r, "data-type", "code-block-info");
                            if (p) {
                                if ("Enter" === t.key || "Tab" === t.key) return n.selectNodeContents(p.nextElementSibling.firstChild), n.collapse(!0), t.preventDefault(), v(e, ["hint"]), !0;
                                if ("Backspace" === t.key) {
                                    var m = (0, D.im)(p, e.ir.element).start;
                                    1 === m && n.setStart(r, 0), 2 === m && (e.hint.recentLanguage = "")
                                }
                                if (nt(e, t, n, p, p.parentElement)) return v(e, ["hint"]), !0
                            }
                            var f = (0, y.lG)(r, "TD") || (0, y.lG)(r, "TH");
                            if (t.key.indexOf("Arrow") > -1 && f) {
                                var h = Qe(f);
                                if (h && nt(e, t, n, f, h)) return !0;
                                var g = $e(f);
                                if (g && tt(e, t, n, f, g)) return !0
                            }
                            if (yt(e, t, n)) return !0;
                            if (Et(e, n, t)) return !0;
                            if (ut(e, n, t)) return !0;
                            var w = (0, b.W)(r);
                            if (w) {
                                var E;
                                if (P("⌘=", t)) return (E = w.querySelector(".vditor-ir__marker--heading")) && E.textContent.trim().length > 1 && At(e, E.textContent.substr(1)), t.preventDefault(), !0;
                                if (P("⌘-", t)) return (E = w.querySelector(".vditor-ir__marker--heading")) && E.textContent.trim().length < 6 && At(e, E.textContent.trim() + "# "), t.preventDefault(), !0
                            }
                            var k = (0, y.F9)(r);
                            if ("Backspace" === t.key && !(0, d.yl)(t) && !t.shiftKey && !t.altKey && "" === n.toString()) {
                                if (kt(e, n, t, s)) return !0;
                                if (k && k.previousElementSibling && "UL" !== k.tagName && "OL" !== k.tagName && ("code-block" === k.previousElementSibling.getAttribute("data-type") || "math-block" === k.previousElementSibling.getAttribute("data-type"))) {
                                    var S = (0, D.im)(k, e.ir.element, n).start;
                                    if (0 === S || 1 === S && k.innerText.startsWith(i.g.ZWSP)) return n.selectNodeContents(k.previousElementSibling.querySelector(".vditor-ir__marker--pre code")), n.collapse(!1), q(n, e), "" === k.textContent.trim().replace(i.g.ZWSP, "") && (k.remove(), Mt(e)), t.preventDefault(), !0
                                }
                                if (w) {
                                    var L = w.firstElementChild.textContent.length;
                                    (0, D.im)(w, e.ir.element).start === L && (n.setStart(w.firstElementChild.firstChild, L - 1), n.collapse(!0), (0, D.Hc)(n))
                                }
                            }
                            return !(("ArrowUp" !== t.key && "ArrowDown" !== t.key || !k || (k.querySelectorAll(".vditor-ir__node").forEach((function (e) {
                                e.contains(r) || e.classList.add("vditor-ir__node--hidden")
                            })), !Lt(t, k, n))) && (Xe(n, t.key), !k || !j(k, e, t, n) || (t.preventDefault(), 0)))
                        }(e, t)) return;
                        if (e.options.ctrlEnter && P("⌘Enter", t)) return e.options.ctrlEnter(a(e)), void t.preventDefault();
                        if (P("⌘Z", t) && !e.toolbar.elements.undo) return e.undo.undo(e), void t.preventDefault();
                        if (P("⌘Y", t) && !e.toolbar.elements.redo) return e.undo.redo(e), void t.preventDefault();
                        if ("Escape" === t.key) return "block" === e.hint.element.style.display ? e.hint.element.style.display = "none" : e.options.esc && !t.isComposing && e.options.esc(a(e)), void t.preventDefault();
                        if ((0, d.yl)(t) && t.altKey && !t.shiftKey && /^Digit[1-6]$/.test(t.code)) {
                            if ("wysiwyg" === e.currentMode) {
                                var n = t.code.replace("Digit", "H");
                                (0, y.lG)(getSelection().getRangeAt(0).startContainer, n) ? ne(e) : te(e, n), Y(e)
                            } else "sv" === e.currentMode ? je(e, "#".repeat(parseInt(t.code.replace("Digit", ""), 10)) + " ") : "ir" === e.currentMode && At(e, "#".repeat(parseInt(t.code.replace("Digit", ""), 10)) + " ");
                            return t.preventDefault(), !0
                        }
                        if ((0, d.yl)(t) && t.altKey && !t.shiftKey && /^Digit[7-9]$/.test(t.code)) return "Digit7" === t.code ? be(e, "wysiwyg", t) : "Digit8" === t.code ? be(e, "ir", t) : "Digit9" === t.code && be(e, "sv", t), !0;
                        e.options.toolbar.find((function (n) {
                            return !n.hotkey || n.toolbar ? !!n.toolbar && !!n.toolbar.find((function (n) {
                                return !!n.hotkey && (P(n.hotkey, t) ? (e.toolbar.elements[n.name].children[0].dispatchEvent(new CustomEvent((0, d.Le)())), t.preventDefault(), !0) : void 0)
                            })) : P(n.hotkey, t) ? (e.toolbar.elements[n.name].children[0].dispatchEvent(new CustomEvent((0, d.Le)())), t.preventDefault(), !0) : void 0
                        }))
                    }
                }))
            }, xe = function (e, t) {
                t.addEventListener("selectstart", (function (n) {
                    t.onmouseup = function () {
                        setTimeout((function () {
                            var t = Ee(e[e.currentMode].element);
                            t.trim() ? ("wysiwyg" === e.currentMode && e.options.comment.enable && ((0, y.a1)(n.target, "data-type", "footnotes-block") || (0, y.a1)(n.target, "data-type", "link-ref-defs-block") ? e.wysiwyg.hideComment() : e.wysiwyg.showComment()), e.options.select && e.options.select(t)) : "wysiwyg" === e.currentMode && e.options.comment.enable && e.wysiwyg.hideComment()
                        }))
                    }
                }))
            }, He = function (e, t) {
                var n = (0, D.zh)(e);
                n.extractContents(), n.insertNode(document.createTextNode(Lute.Caret)), n.insertNode(document.createTextNode(t));
                var r = (0, y.a1)(n.startContainer, "data-block", "0");
                r || (r = e.sv.element);
                var i = e.lute.SpinVditorSVDOM(r.textContent);
                i = i.indexOf('data-type="footnotes-link"') > -1 || i.indexOf('data-type="link-ref-defs-block"') > -1 ? "<div data-block='0'>" + i + "</div>" : "<div data-block='0'>" + i.replace(/<span data-type="newline"><br \/><span style="display: none">\n<\/span><\/span><span data-type="newline"><br \/><span style="display: none">\n<\/span><\/span></g, '<span data-type="newline"><br /><span style="display: none">\n</span></span><span data-type="newline"><br /><span style="display: none">\n</span></span></div><div data-block="0"><') + "</div>", r.isEqualNode(e.sv.element) ? r.innerHTML = i : r.outerHTML = i, (0, D.ib)(e.sv.element, n), Ae(e)
            }, Ne = function (e, t, n) {
                void 0 === n && (n = !0);
                var r = e;
                for (3 === r.nodeType && (r = r.parentElement); r;) {
                    if (r.getAttribute("data-type") === t) return r;
                    r = n ? r.previousElementSibling : r.nextElementSibling
                }
                return !1
            }, De = function (e, t) {
                w("SpinVditorSVDOM", e, "argument", t.options.debugger);
                var n = t.lute.SpinVditorSVDOM(e);
                return e = n.indexOf('data-type="footnotes-link"') > -1 || n.indexOf('data-type="link-ref-defs-block"') > -1 ? "<div data-block='0'>" + n + "</div>" : "<div data-block='0'>" + n.replace(/<span data-type="newline"><br \/><span style="display: none">\n<\/span><\/span><span data-type="newline"><br \/><span style="display: none">\n<\/span><\/span></g, '<span data-type="newline"><br /><span style="display: none">\n</span></span><span data-type="newline"><br /><span style="display: none">\n</span></span></div><div data-block="0"><') + "</div>", w("SpinVditorSVDOM", e, "result", t.options.debugger), e
            }, Oe = function (e) {
                var t = e.getAttribute("data-type"), n = e.previousElementSibling,
                    r = t && "text" !== t && "table" !== t && "heading-marker" !== t && "newline" !== t && "yaml-front-matter-open-marker" !== t && "yaml-front-matter-close-marker" !== t && "code-block-info" !== t && "code-block-close-marker" !== t && "code-block-open-marker" !== t ? e.textContent : "",
                    i = !1;
                for ("newline" === t && (i = !0); n && !i;) {
                    var o = n.getAttribute("data-type");
                    if ("li-marker" === o || "blockquote-marker" === o || "task-marker" === o || "padding" === o) {
                        var a = n.textContent;
                        if ("li-marker" !== o || "code-block-open-marker" !== t && "code-block-info" !== t) if ("code-block-close-marker" === t && n.nextElementSibling.isSameNode(e)) {
                            var l = Ne(e, "code-block-open-marker");
                            l && l.previousElementSibling && (n = l.previousElementSibling, r = a + r)
                        } else r = a + r; else r = a.replace(/\S/g, " ") + r
                    } else "newline" === o && (i = !0);
                    n = n.previousElementSibling
                }
                return r
            }, Ie = function (e, t) {
                void 0 === t && (t = {
                    enableAddUndoStack: !0,
                    enableHint: !1,
                    enableInput: !0
                }), t.enableHint && e.hint.render(e), e.preview.render(e);
                var n = a(e);
                "function" == typeof e.options.input && t.enableInput && e.options.input(n), e.options.counter.enable && e.counter.render(e, n), e.options.cache.enable && (0, d.pK)() && (localStorage.setItem(e.options.cache.id, n), e.options.cache.after && e.options.cache.after(n)), e.devtools && e.devtools.renderEchart(e), clearTimeout(e.sv.processTimeoutId), e.sv.processTimeoutId = window.setTimeout((function () {
                    t.enableAddUndoStack && !e.sv.composingLock && e.undo.addToUndoStack(e)
                }), e.options.undoDelay)
            }, je = function (e, t) {
                var n = (0, D.zh)(e), r = (0, b.S)(n.startContainer, "SPAN");
                r && "" !== r.textContent.trim() && (t = "\n" + t), n.collapse(!0), document.execCommand("insertHTML", !1, t)
            }, Re = function (e, t, n, r) {
                var i = (0, D.zh)(e), o = t.getAttribute("data-type");
                0 === e.sv.element.childNodes.length && (e.sv.element.innerHTML = '<span data-type="p" data-block="0"><span data-type="text"><wbr></span></span><span data-type="newline"><br><span style="display: none">\n</span></span>', (0, D.ib)(e.sv.element, i));
                var a = (0, y.F9)(i.startContainer), l = (0, b.S)(i.startContainer, "SPAN");
                if (a) {
                    if ("link" === o) {
                        var s = void 0;
                        return s = "" === i.toString() ? "" + n + Lute.Caret + r : "" + n + i.toString() + r.replace(")", Lute.Caret + ")"), void document.execCommand("insertHTML", !1, s)
                    }
                    if ("italic" === o || "bold" === o || "strike" === o || "inline-code" === o || "code" === o || "table" === o || "line" === o) {
                        s = void 0;
                        return s = "" === i.toString() ? "" + n + Lute.Caret + ("code" === o ? "" : r) : "" + n + i.toString() + Lute.Caret + ("code" === o ? "" : r), "table" === o || "code" === o && l && "" !== l.textContent ? s = "\n\n" + s : "line" === o && (s = "\n\n" + n + "\n" + Lute.Caret), void document.execCommand("insertHTML", !1, s)
                    }
                    if (("check" === o || "list" === o || "ordered-list" === o || "quote" === o) && l) {
                        var d = "* ";
                        "check" === o ? d = "* [ ] " : "ordered-list" === o ? d = "1. " : "quote" === o && (d = "> ");
                        var c = Ne(l, "newline");
                        return c ? c.insertAdjacentText("afterend", d) : a.insertAdjacentText("afterbegin", d), void V(e)
                    }
                    (0, D.ib)(e.sv.element, i), Ie(e)
                }
            }, Pe = function (e) {
                switch (e.currentMode) {
                    case"ir":
                        return e.ir.element;
                    case"wysiwyg":
                        return e.wysiwyg.element;
                    case"sv":
                        return e.sv.element
                }
            }, qe = function (e, t) {
                e.options.upload.setHeaders && (e.options.upload.headers = e.options.upload.setHeaders()), e.options.upload.headers && Object.keys(e.options.upload.headers).forEach((function (n) {
                    t.setRequestHeader(n, e.options.upload.headers[n])
                }))
            }, Be = function (e, t, n, r) {
                return new (n || (n = Promise))((function (i, o) {
                    function a(e) {
                        try {
                            s(r.next(e))
                        } catch (e) {
                            o(e)
                        }
                    }

                    function l(e) {
                        try {
                            s(r.throw(e))
                        } catch (e) {
                            o(e)
                        }
                    }

                    function s(e) {
                        var t;
                        e.done ? i(e.value) : (t = e.value, t instanceof n ? t : new n((function (e) {
                            e(t)
                        }))).then(a, l)
                    }

                    s((r = r.apply(e, t || [])).next())
                }))
            }, Ve = function (e, t) {
                var n, r, i, o, a = {
                    label: 0, sent: function () {
                        if (1 & i[0]) throw i[1];
                        return i[1]
                    }, trys: [], ops: []
                };
                return o = {
                    next: l(0),
                    throw: l(1),
                    return: l(2)
                }, "function" == typeof Symbol && (o[Symbol.iterator] = function () {
                    return this
                }), o;

                function l(o) {
                    return function (l) {
                        return function (o) {
                            if (n) throw new TypeError("Generator is already executing.");
                            for (; a;) try {
                                if (n = 1, r && (i = 2 & o[0] ? r.return : o[0] ? r.throw || ((i = r.return) && i.call(r), 0) : r.next) && !(i = i.call(r, o[1])).done) return i;
                                switch (r = 0, i && (o = [2 & o[0], i.value]), o[0]) {
                                    case 0:
                                    case 1:
                                        i = o;
                                        break;
                                    case 4:
                                        return a.label++, {value: o[1], done: !1};
                                    case 5:
                                        a.label++, r = o[1], o = [0];
                                        continue;
                                    case 7:
                                        o = a.ops.pop(), a.trys.pop();
                                        continue;
                                    default:
                                        if (!(i = a.trys, (i = i.length > 0 && i[i.length - 1]) || 6 !== o[0] && 2 !== o[0])) {
                                            a = 0;
                                            continue
                                        }
                                        if (3 === o[0] && (!i || o[1] > i[0] && o[1] < i[3])) {
                                            a.label = o[1];
                                            break
                                        }
                                        if (6 === o[0] && a.label < i[1]) {
                                            a.label = i[1], i = o;
                                            break
                                        }
                                        if (i && a.label < i[2]) {
                                            a.label = i[2], a.ops.push(o);
                                            break
                                        }
                                        i[2] && a.ops.pop(), a.trys.pop();
                                        continue
                                }
                                o = t.call(e, a)
                            } catch (e) {
                                o = [6, e], r = 0
                            } finally {
                                n = i = 0
                            }
                            if (5 & o[0]) throw o[1];
                            return {value: o[0] ? o[1] : void 0, done: !0}
                        }([o, l])
                    }
                }
            }, Ue = function () {
                this.isUploading = !1, this.element = document.createElement("div"), this.element.className = "vditor-upload"
            }, We = function (e, t, n) {
                return Be(void 0, void 0, void 0, (function () {
                    var r, i, o, a, l, s, d, c, u, p, m, f, h, v;
                    return Ve(this, (function (g) {
                        switch (g.label) {
                            case 0:
                                for (r = [], i = !0 === e.options.upload.multiple ? t.length : 1, f = 0; f < i; f++) (o = t[f]) instanceof DataTransferItem && (o = o.getAsFile()), r.push(o);
                                return e.options.upload.handler ? [4, e.options.upload.handler(r)] : [3, 2];
                            case 1:
                                return a = g.sent(), n && (n.value = ""), "string" == typeof a ? (e.tip.show(a), [2]) : [2];
                            case 2:
                                return e.options.upload.url && e.upload ? e.options.upload.file ? [4, e.options.upload.file(r)] : [3, 4] : (n && (n.value = ""), e.tip.show("please config: options.upload.url"), [2]);
                            case 3:
                                r = g.sent(), g.label = 4;
                            case 4:
                                if (e.options.upload.validate && "string" == typeof (a = e.options.upload.validate(r))) return e.tip.show(a), [2];
                                if (l = Pe(e), e.upload.range = (0, D.zh)(e), s = function (e, t) {
                                    e.tip.hide();
                                    for (var n = [], r = "", i = "", o = (e.options.lang, e.options, function (o, a) {
                                        var l = t[a], s = !0;
                                        l.name || (r += "<li>" + window.VditorI18n.nameEmpty + "</li>", s = !1), l.size > e.options.upload.max && (r += "<li>" + l.name + " " + window.VditorI18n.over + " " + e.options.upload.max / 1024 / 1024 + "M</li>", s = !1);
                                        var d = l.name.lastIndexOf("."), c = l.name.substr(d),
                                            u = e.options.upload.filename(l.name.substr(0, d)) + c;
                                        e.options.upload.accept && (e.options.upload.accept.split(",").some((function (e) {
                                            var t = e.trim();
                                            if (0 === t.indexOf(".")) {
                                                if (c.toLowerCase() === t.toLowerCase()) return !0
                                            } else if (l.type.split("/")[0] === t.split("/")[0]) return !0;
                                            return !1
                                        })) || (r += "<li>" + l.name + " " + window.VditorI18n.fileTypeError + "</li>", s = !1)), s && (n.push(l), i += "<li>" + u + " " + window.VditorI18n.uploading + "</li>")
                                    }), a = t.length, l = 0; l < a; l++) o(0, l);
                                    return e.tip.show("<ul>" + r + i + "</ul>"), n
                                }(e, r), 0 === s.length) return n && (n.value = ""), [2];
                                for (d = new FormData, c = e.options.upload.extraData, u = 0, p = Object.keys(c); u < p.length; u++) m = p[u], d.append(m, c[m]);
                                for (f = 0, h = s.length; f < h; f++) d.append(e.options.upload.fieldName, s[f]);
                                return (v = new XMLHttpRequest).open("POST", e.options.upload.url), e.options.upload.token && v.setRequestHeader("X-Upload-Token", e.options.upload.token), e.options.upload.withCredentials && (v.withCredentials = !0), qe(e, v), e.upload.isUploading = !0, l.setAttribute("contenteditable", "false"), v.onreadystatechange = function () {
                                    if (v.readyState === XMLHttpRequest.DONE) {
                                        if (e.upload.isUploading = !1, l.setAttribute("contenteditable", "true"), v.status >= 200 && v.status < 300) if (e.options.upload.success) e.options.upload.success(l, v.responseText); else {
                                            var r = v.responseText;
                                            e.options.upload.format && (r = e.options.upload.format(t, v.responseText)), function (e, t) {
                                                Pe(t).focus();
                                                var n = JSON.parse(e), r = "";
                                                1 === n.code && (r = "" + n.msg), n.data.errFiles && n.data.errFiles.length > 0 && (r = "<ul><li>" + r + "</li>", n.data.errFiles.forEach((function (e) {
                                                    var n = e.lastIndexOf("."),
                                                        i = t.options.upload.filename(e.substr(0, n)) + e.substr(n);
                                                    r += "<li>" + i + " " + window.VditorI18n.uploadError + "</li>"
                                                })), r += "</ul>"), r ? t.tip.show(r) : t.tip.hide();
                                                var i = "";
                                                Object.keys(n.data.succMap).forEach((function (e) {
                                                    var r = n.data.succMap[e], o = e.lastIndexOf("."), a = e.substr(o),
                                                        l = t.options.upload.filename(e.substr(0, o)) + a;
                                                    0 === (a = a.toLowerCase()).indexOf(".wav") || 0 === a.indexOf(".mp3") || 0 === a.indexOf(".ogg") ? "wysiwyg" === t.currentMode ? i += '<div class="vditor-wysiwyg__block" data-type="html-block"\n data-block="0"><pre><code>&lt;audio controls="controls" src="' + r + '"&gt;&lt;/audio&gt;</code></pre><pre class="vditor-wysiwyg__preview" data-render="1"><audio controls="controls" src="' + r + '"></audio></pre></div>\n' : "ir" === t.currentMode ? i += '<audio controls="controls" src="' + r + '"></audio>\n' : i += "[" + l + "](" + r + ")\n" : 0 === a.indexOf(".apng") || 0 === a.indexOf(".bmp") || 0 === a.indexOf(".gif") || 0 === a.indexOf(".ico") || 0 === a.indexOf(".cur") || 0 === a.indexOf(".jpg") || 0 === a.indexOf(".jpeg") || 0 === a.indexOf(".jfif") || 0 === a.indexOf(".pjp") || 0 === a.indexOf(".pjpeg") || 0 === a.indexOf(".png") || 0 === a.indexOf(".svg") || 0 === a.indexOf(".webp") ? "wysiwyg" === t.currentMode ? i += '<images alt="' + l + '" src="' + r + '">\n' : i += "![" + l + "](" + r + ")\n" : "wysiwyg" === t.currentMode ? i += '<a href="' + r + '">' + l + "</a>\n" : i += "[" + l + "](" + r + ")\n"
                                                })), (0, D.Hc)(t.upload.range), document.execCommand("insertHTML", !1, i), t.upload.range = getSelection().getRangeAt(0).cloneRange()
                                            }(r, e)
                                        } else e.options.upload.error ? e.options.upload.error(v.responseText) : e.tip.show(v.responseText);
                                        n && (n.value = ""), e.upload.element.style.display = "none"
                                    }
                                }, v.upload.onprogress = function (t) {
                                    if (t.lengthComputable) {
                                        var n = t.loaded / t.total * 100;
                                        e.upload.element.style.display = "block", e.upload.element.style.width = n + "%"
                                    }
                                }, v.send(d), [2]
                        }
                    }))
                }))
            }, ze = function (e, t, n) {
                var r, o = (0, y.F9)(t.startContainer);
                if (o || (o = e.wysiwyg.element), n && "formatItalic" !== n.inputType && "deleteByDrag" !== n.inputType && "insertFromDrop" !== n.inputType && "formatBold" !== n.inputType && "formatRemove" !== n.inputType && "formatStrikeThrough" !== n.inputType && "insertUnorderedList" !== n.inputType && "insertOrderedList" !== n.inputType && "formatOutdent" !== n.inputType && "formatIndent" !== n.inputType && "" !== n.inputType || !n) {
                    var a = function (e) {
                        for (var t = e.previousSibling; t;) {
                            if (3 !== t.nodeType && "A" === t.tagName && !t.previousSibling && "" === t.innerHTML.replace(i.g.ZWSP, "") && t.nextSibling) return t;
                            t = t.previousSibling
                        }
                        return !1
                    }(t.startContainer);
                    a && a.remove(), e.wysiwyg.element.querySelectorAll("wbr").forEach((function (e) {
                        e.remove()
                    })), t.insertNode(document.createElement("wbr")), o.querySelectorAll("[style]").forEach((function (e) {
                        e.removeAttribute("style")
                    })), o.querySelectorAll(".vditor-comment").forEach((function (e) {
                        "" === e.textContent.trim() && (e.classList.remove("vditor-comment", "vditor-comment--focus"), e.removeAttribute("data-cmtids"))
                    })), null === (r = o.previousElementSibling) || void 0 === r || r.querySelectorAll(".vditor-comment").forEach((function (e) {
                        "" === e.textContent.trim() && (e.classList.remove("vditor-comment", "vditor-comment--focus"), e.removeAttribute("data-cmtids"))
                    }));
                    var l = "";
                    "link-ref-defs-block" === o.getAttribute("data-type") && (o = e.wysiwyg.element);
                    var s, d = o.isEqualNode(e.wysiwyg.element), c = (0, y.a1)(o, "data-type", "footnotes-block");
                    if (d) l = o.innerHTML; else {
                        var u = (0, y.O9)(t.startContainer);
                        if (u && !c) {
                            var p = (0, b.S)(t.startContainer, "BLOCKQUOTE");
                            o = p ? (0, y.F9)(t.startContainer) || o : u
                        }
                        if (c && (o = c), l = o.outerHTML, "UL" === o.tagName || "OL" === o.tagName) {
                            var m = o.previousElementSibling, f = o.nextElementSibling;
                            !m || "UL" !== m.tagName && "OL" !== m.tagName || (l = m.outerHTML + l, m.remove()), !f || "UL" !== f.tagName && "OL" !== f.tagName || (l += f.outerHTML, f.remove()), l = l.replace("<div><wbr><br></div>", "<li><p><wbr><br></p></li>")
                        }
                        o.innerText.startsWith("```") || (e.wysiwyg.element.querySelectorAll("[data-type='link-ref-defs-block']").forEach((function (e) {
                            e && !o.isEqualNode(e) && (l += e.outerHTML, e.remove())
                        })), e.wysiwyg.element.querySelectorAll("[data-type='footnotes-block']").forEach((function (e) {
                            e && !o.isEqualNode(e) && (l += e.outerHTML, e.remove())
                        })))
                    }
                    if ('<p data-block="0">```<wbr></p>' === (l = l.replace(/<\/(strong|b)><strong data-marker="\W{2}">/g, "").replace(/<\/(em|i)><em data-marker="\W{1}">/g, "").replace(/<\/(s|strike)><s data-marker="~{1,2}">/g, "")) && e.hint.recentLanguage && (l = '<p data-block="0">```<wbr></p>'.replace("```", "```" + e.hint.recentLanguage)), w("SpinVditorDOM", l, "argument", e.options.debugger), l = e.lute.SpinVditorDOM(l), w("SpinVditorDOM", l, "result", e.options.debugger), d) o.innerHTML = l; else if (o.outerHTML = l, c) {
                        var h = (0, y.E2)(e.wysiwyg.element.querySelector("wbr"), "LI");
                        if (h) {
                            var v = e.wysiwyg.element.querySelector('sup[data-type="footnotes-ref"][data-footnotes-label="' + h.getAttribute("data-marker") + '"]');
                            v && v.setAttribute("aria-label", h.textContent.trim().substr(0, 24))
                        }
                    }
                    var g, E = e.wysiwyg.element.querySelectorAll("[data-type='link-ref-defs-block']");
                    E.forEach((function (e, t) {
                        0 === t ? s = e : (s.insertAdjacentHTML("beforeend", e.innerHTML), e.remove())
                    })), E.length > 0 && e.wysiwyg.element.insertAdjacentElement("beforeend", E[0]);
                    var k = e.wysiwyg.element.querySelectorAll("[data-type='footnotes-block']");
                    k.forEach((function (e, t) {
                        0 === t ? g = e : (g.insertAdjacentHTML("beforeend", e.innerHTML), e.remove())
                    })), k.length > 0 && e.wysiwyg.element.insertAdjacentElement("beforeend", k[0]), (0, D.ib)(e.wysiwyg.element, t), e.wysiwyg.element.querySelectorAll(".vditor-wysiwyg__preview[data-render='2']").forEach((function (t) {
                        N(t, e)
                    })), n && ("deleteContentBackward" === n.inputType || "deleteContentForward" === n.inputType) && e.options.comment.enable && (e.wysiwyg.triggerRemoveComment(e), e.options.comment.adjustTop(e.wysiwyg.getComments(e, !0)))
                }
                O(e), Y(e, {enableAddUndoStack: !0, enableHint: !0, enableInput: !0})
            }, Ge = function (e, t) {
                return Object.defineProperty ? Object.defineProperty(e, "raw", {value: t}) : e.raw = t, e
            }, Ke = function (e, t, n, r) {
                return new (n || (n = Promise))((function (i, o) {
                    function a(e) {
                        try {
                            s(r.next(e))
                        } catch (e) {
                            o(e)
                        }
                    }

                    function l(e) {
                        try {
                            s(r.throw(e))
                        } catch (e) {
                            o(e)
                        }
                    }

                    function s(e) {
                        var t;
                        e.done ? i(e.value) : (t = e.value, t instanceof n ? t : new n((function (e) {
                            e(t)
                        }))).then(a, l)
                    }

                    s((r = r.apply(e, t || [])).next())
                }))
            }, Fe = function (e, t) {
                var n, r, i, o, a = {
                    label: 0, sent: function () {
                        if (1 & i[0]) throw i[1];
                        return i[1]
                    }, trys: [], ops: []
                };
                return o = {
                    next: l(0),
                    throw: l(1),
                    return: l(2)
                }, "function" == typeof Symbol && (o[Symbol.iterator] = function () {
                    return this
                }), o;

                function l(o) {
                    return function (l) {
                        return function (o) {
                            if (n) throw new TypeError("Generator is already executing.");
                            for (; a;) try {
                                if (n = 1, r && (i = 2 & o[0] ? r.return : o[0] ? r.throw || ((i = r.return) && i.call(r), 0) : r.next) && !(i = i.call(r, o[1])).done) return i;
                                switch (r = 0, i && (o = [2 & o[0], i.value]), o[0]) {
                                    case 0:
                                    case 1:
                                        i = o;
                                        break;
                                    case 4:
                                        return a.label++, {value: o[1], done: !1};
                                    case 5:
                                        a.label++, r = o[1], o = [0];
                                        continue;
                                    case 7:
                                        o = a.ops.pop(), a.trys.pop();
                                        continue;
                                    default:
                                        if (!(i = a.trys, (i = i.length > 0 && i[i.length - 1]) || 6 !== o[0] && 2 !== o[0])) {
                                            a = 0;
                                            continue
                                        }
                                        if (3 === o[0] && (!i || o[1] > i[0] && o[1] < i[3])) {
                                            a.label = o[1];
                                            break
                                        }
                                        if (6 === o[0] && a.label < i[1]) {
                                            a.label = i[1], i = o;
                                            break
                                        }
                                        if (i && a.label < i[2]) {
                                            a.label = i[2], a.ops.push(o);
                                            break
                                        }
                                        i[2] && a.ops.pop(), a.trys.pop();
                                        continue
                                }
                                o = t.call(e, a)
                            } catch (e) {
                                o = [6, e], r = 0
                            } finally {
                                n = i = 0
                            }
                            if (5 & o[0]) throw o[1];
                            return {value: o[0] ? o[1] : void 0, done: !0}
                        }([o, l])
                    }
                }
            }, Ze = function (e, t, n) {
                if (229 === e.keyCode && "" === e.code && "Unidentified" === e.key && "sv" !== t.currentMode) {
                    var r = (0, y.F9)(n);
                    if (r && "" === r.textContent.trim()) return t[t.currentMode].composingLock = !0, !1
                }
                return !0
            }, Je = function (e, t, n) {
                if (!("Enter" === n.key || "Tab" === n.key || "Backspace" === n.key || n.key.indexOf("Arrow") > -1 || (0, d.yl)(n) || "Escape" === n.key || n.shiftKey || n.altKey)) {
                    var r = (0, y.lG)(e.startContainer, "P") || (0, y.lG)(e.startContainer, "LI");
                    if (r && 0 === (0, D.im)(r, t[t.currentMode].element, e).start) {
                        r.nodeValue && (r.nodeValue = r.nodeValue.replace(/\u2006/g, ""));
                        var o = document.createTextNode(i.g.ZWSP);
                        e.insertNode(o), e.setStartAfter(o)
                    }
                }
            }, Xe = function (e, t) {
                if ("ArrowDown" === t || "ArrowUp" === t) {
                    var n = (0, y.a1)(e.startContainer, "data-type", "math-inline") || (0, y.a1)(e.startContainer, "data-type", "html-entity") || (0, y.a1)(e.startContainer, "data-type", "html-inline");
                    n && ("ArrowDown" === t && e.setStartAfter(n.parentElement), "ArrowUp" === t && e.setStartBefore(n.parentElement))
                }
            }, Ye = function (e, t) {
                var n = (0, D.zh)(e), r = (0, y.F9)(n.startContainer);
                r && (r.insertAdjacentHTML(t, '<p data-block="0">' + i.g.ZWSP + "<wbr>\n</p>"), (0, D.ib)(e[e.currentMode].element, n), fe(e), dt(e))
            }, Qe = function (e) {
                var t = (0, y.lG)(e, "TABLE");
                return !(!t || !t.rows[0].cells[0].isSameNode(e)) && t
            }, $e = function (e) {
                var t = (0, y.lG)(e, "TABLE");
                return !(!t || !t.lastElementChild.lastElementChild.lastElementChild.isSameNode(e)) && t
            }, et = function (e, t, n) {
                void 0 === n && (n = !0);
                var r = e.previousElementSibling;
                return r || (r = e.parentElement.previousElementSibling ? e.parentElement.previousElementSibling.lastElementChild : "TBODY" === e.parentElement.parentElement.tagName && e.parentElement.parentElement.previousElementSibling ? e.parentElement.parentElement.previousElementSibling.lastElementChild.lastElementChild : null), r && (t.selectNodeContents(r), n || t.collapse(!1), (0, D.Hc)(t)), r
            }, tt = function (e, t, n, r, o) {
                var a = (0, D.im)(r, e[e.currentMode].element, n);
                if ("ArrowDown" === t.key && -1 === r.textContent.trimRight().substr(a.start).indexOf("\n") || "ArrowRight" === t.key && a.start >= r.textContent.trimRight().length) {
                    var l = o.nextElementSibling;
                    return !l || l && ("TABLE" === l.tagName || l.getAttribute("data-type")) ? (o.insertAdjacentHTML("afterend", '<p data-block="0">' + i.g.ZWSP + "<wbr></p>"), (0, D.ib)(e[e.currentMode].element, n)) : (n.selectNodeContents(l), n.collapse(!0), (0, D.Hc)(n)), t.preventDefault(), !0
                }
                return !1
            }, nt = function (e, t, n, r, o) {
                var a = (0, D.im)(r, e[e.currentMode].element, n);
                if ("ArrowUp" === t.key && -1 === r.textContent.substr(0, a.start).indexOf("\n") || ("ArrowLeft" === t.key || "Backspace" === t.key && "" === n.toString()) && 0 === a.start) {
                    var l = o.previousElementSibling;
                    return !l || l && ("TABLE" === l.tagName || l.getAttribute("data-type")) ? (o.insertAdjacentHTML("beforebegin", '<p data-block="0">' + i.g.ZWSP + "<wbr></p>"), (0, D.ib)(e[e.currentMode].element, n)) : (n.selectNodeContents(l), n.collapse(!1), (0, D.Hc)(n)), t.preventDefault(), !0
                }
                return !1
            }, rt = function (e, t, n, r) {
                void 0 === r && (r = !0);
                var i = (0, y.lG)(t.startContainer, "LI");
                if (e[e.currentMode].element.querySelectorAll("wbr").forEach((function (e) {
                    e.remove()
                })), t.insertNode(document.createElement("wbr")), r && i) {
                    for (var o = "", a = 0; a < i.parentElement.childElementCount; a++) {
                        var l = i.parentElement.children[a].querySelector("input");
                        l && l.remove(), o += '<p data-block="0">' + i.parentElement.children[a].innerHTML.trimLeft() + "</p>"
                    }
                    i.parentElement.insertAdjacentHTML("beforebegin", o), i.parentElement.remove()
                } else if (i) if ("check" === n) i.parentElement.querySelectorAll("li").forEach((function (e) {
                    e.insertAdjacentHTML("afterbegin", '<input type="checkbox" />' + (0 === e.textContent.indexOf(" ") ? "" : " ")), e.classList.add("vditor-task")
                })); else {
                    i.querySelector("input") && i.parentElement.querySelectorAll("li").forEach((function (e) {
                        e.querySelector("input").remove(), e.classList.remove("vditor-task")
                    }));
                    var s = void 0;
                    "list" === n ? (s = document.createElement("ul")).setAttribute("data-marker", "*") : (s = document.createElement("ol")).setAttribute("data-marker", "1."), s.setAttribute("data-block", "0"), s.setAttribute("data-tight", i.parentElement.getAttribute("data-tight")), s.innerHTML = i.parentElement.innerHTML, i.parentElement.parentNode.replaceChild(s, i.parentElement)
                } else {
                    var d = (0, y.a1)(t.startContainer, "data-block", "0");
                    d || (e[e.currentMode].element.querySelector("wbr").remove(), (d = e[e.currentMode].element.querySelector("p")).innerHTML = "<wbr>"), "check" === n ? (d.insertAdjacentHTML("beforebegin", '<ul data-block="0"><li class="vditor-task"><input type="checkbox" /> ' + d.innerHTML + "</li></ul>"), d.remove()) : "list" === n ? (d.insertAdjacentHTML("beforebegin", '<ul data-block="0"><li>' + d.innerHTML + "</li></ul>"), d.remove()) : "ordered-list" === n && (d.insertAdjacentHTML("beforebegin", '<ol data-block="0"><li>' + d.innerHTML + "</li></ol>"), d.remove())
                }
            }, it = function (e, t, n) {
                var r = t.previousElementSibling;
                if (t && r) {
                    var i = [t];
                    Array.from(n.cloneContents().children).forEach((function (e, n) {
                        3 !== e.nodeType && t && "" !== e.textContent.trim() && t.getAttribute("data-node-id") === e.getAttribute("data-node-id") && (0 !== n && i.push(t), t = t.nextElementSibling)
                    })), e[e.currentMode].element.querySelectorAll("wbr").forEach((function (e) {
                        e.remove()
                    })), n.insertNode(document.createElement("wbr"));
                    var o = r.parentElement, a = "";
                    i.forEach((function (e) {
                        var t = e.getAttribute("data-marker");
                        1 !== t.length && (t = "1" + t.slice(-1)), a += '<li data-node-id="' + e.getAttribute("data-node-id") + '" data-marker="' + t + '">' + e.innerHTML + "</li>", e.remove()
                    })), r.insertAdjacentHTML("beforeend", "<" + o.tagName + ' data-block="0">' + a + "</" + o.tagName + ">"), "wysiwyg" === e.currentMode ? o.outerHTML = e.lute.SpinVditorDOM(o.outerHTML) : o.outerHTML = e.lute.SpinVditorIRDOM(o.outerHTML), (0, D.ib)(e[e.currentMode].element, n);
                    var l = (0, y.O9)(n.startContainer);
                    l && l.querySelectorAll(".vditor-" + e.currentMode + "__preview[data-render='2']").forEach((function (t) {
                        N(t, e), "wysiwyg" === e.currentMode && t.previousElementSibling.setAttribute("style", "display:none")
                    })), dt(e), fe(e)
                } else e[e.currentMode].element.focus()
            }, ot = function (e, t, n, r) {
                var i = (0, y.lG)(t.parentElement, "LI");
                if (i) {
                    e[e.currentMode].element.querySelectorAll("wbr").forEach((function (e) {
                        e.remove()
                    })), n.insertNode(document.createElement("wbr"));
                    var o = t.parentElement, a = o.cloneNode(), l = [t];
                    Array.from(n.cloneContents().children).forEach((function (e, n) {
                        3 !== e.nodeType && t && "" !== e.textContent.trim() && t.getAttribute("data-node-id") === e.getAttribute("data-node-id") && (0 !== n && l.push(t), t = t.nextElementSibling)
                    }));
                    var s = !1, d = "";
                    o.querySelectorAll("li").forEach((function (e) {
                        s && (d += e.outerHTML, e.nextElementSibling || e.previousElementSibling ? e.remove() : e.parentElement.remove()), e.isSameNode(l[l.length - 1]) && (s = !0)
                    })), l.reverse().forEach((function (e) {
                        i.insertAdjacentElement("afterend", e)
                    })), d && (a.innerHTML = d, l[0].insertAdjacentElement("beforeend", a)), "wysiwyg" === e.currentMode ? r.outerHTML = e.lute.SpinVditorDOM(r.outerHTML) : r.outerHTML = e.lute.SpinVditorIRDOM(r.outerHTML), (0, D.ib)(e[e.currentMode].element, n);
                    var c = (0, y.O9)(n.startContainer);
                    c && c.querySelectorAll(".vditor-" + e.currentMode + "__preview[data-render='2']").forEach((function (t) {
                        N(t, e), "wysiwyg" === e.currentMode && t.previousElementSibling.setAttribute("style", "display:none")
                    })), dt(e), fe(e)
                } else e[e.currentMode].element.focus()
            }, at = function (e, t) {
                for (var n = getSelection().getRangeAt(0).startContainer.parentElement, r = e.rows[0].cells.length, i = e.rows.length, o = 0, a = 0; a < i; a++) for (var l = 0; l < r; l++) if (e.rows[a].cells[l].isSameNode(n)) {
                    o = l;
                    break
                }
                for (var s = 0; s < i; s++) e.rows[s].cells[o].setAttribute("align", t)
            }, lt = function (e) {
                var t = e.trimRight().split("\n").pop();
                return "" !== t && (("" === t.replace(/ |-/g, "") || "" === t.replace(/ |_/g, "") || "" === t.replace(/ |\*/g, "")) && (t.replace(/ /g, "").length > 2 && (!(t.indexOf("-") > -1 && -1 === t.trimLeft().indexOf(" ") && e.trimRight().split("\n").length > 1) && (0 !== t.indexOf("    ") && 0 !== t.indexOf("\t")))))
            }, st = function (e) {
                var t = e.trimRight().split("\n");
                return 0 !== (e = t.pop()).indexOf("    ") && 0 !== e.indexOf("\t") && ("" !== (e = e.trimLeft()) && 0 !== t.length && ("" === e.replace(/-/g, "") || "" === e.replace(/=/g, "")))
            }, dt = function (e, t) {
                void 0 === t && (t = {
                    enableAddUndoStack: !0,
                    enableHint: !1,
                    enableInput: !0
                }), "wysiwyg" === e.currentMode ? Y(e, t) : "ir" === e.currentMode ? Mt(e, t) : "sv" === e.currentMode && Ie(e, t)
            }, ct = function (e, t, n, r) {
                var o, a = e.startContainer, l = (0, y.lG)(a, "LI");
                if (l) {
                    if (!(0, d.yl)(r) && !r.altKey && "Enter" === r.key && !r.shiftKey && n && l.contains(n) && n.nextElementSibling) return l && !l.textContent.endsWith("\n") && l.insertAdjacentText("beforeend", "\n"), e.insertNode(document.createTextNode("\n\n")), e.collapse(!1), dt(t), r.preventDefault(), !0;
                    if (!((0, d.yl)(r) || r.shiftKey || r.altKey || "Backspace" !== r.key || l.previousElementSibling || "" !== e.toString() || 0 !== (0, D.im)(l, t[t.currentMode].element, e).start)) return l.nextElementSibling ? (l.parentElement.insertAdjacentHTML("beforebegin", '<p data-block="0"><wbr>' + l.innerHTML + "</p>"), l.remove()) : l.parentElement.outerHTML = '<p data-block="0"><wbr>' + l.innerHTML + "</p>", (0, D.ib)(t[t.currentMode].element, e), dt(t), r.preventDefault(), !0;
                    if (!(0, d.yl)(r) && !r.shiftKey && !r.altKey && "Backspace" === r.key && "" === l.textContent.trim().replace(i.g.ZWSP, "") && "" === e.toString() && "LI" === (null === (o = l.previousElementSibling) || void 0 === o ? void 0 : o.tagName)) return l.previousElementSibling.insertAdjacentText("beforeend", "\n\n"), e.selectNodeContents(l.previousElementSibling), e.collapse(!1), l.remove(), (0, D.ib)(t[t.currentMode].element, e), dt(t), r.preventDefault(), !0;
                    if (!(0, d.yl)(r) && !r.altKey && "Tab" === r.key) {
                        var s = !1;
                        if ((0 === e.startOffset && (3 === a.nodeType && !a.previousSibling || 3 !== a.nodeType && "LI" === a.nodeName) || l.classList.contains("vditor-task") && 1 === e.startOffset && 3 !== a.previousSibling.nodeType && "INPUT" === a.previousSibling.tagName) && (s = !0), s || "" !== e.toString()) return r.shiftKey ? ot(t, l, e, l.parentElement) : it(t, l, e), r.preventDefault(), !0
                    }
                }
                return !1
            }, ut = function (e, t, n) {
                if (e.options.tab && "Tab" === n.key) return n.shiftKey || ("" === t.toString() ? (t.insertNode(document.createTextNode(e.options.tab)), t.collapse(!1)) : (t.extractContents(), t.insertNode(document.createTextNode(e.options.tab)), t.collapse(!1))), (0, D.Hc)(t), dt(e), n.preventDefault(), !0
            }, pt = function (e, t, n, r) {
                if (n) {
                    if (!(0, d.yl)(e) && !e.altKey && "Enter" === e.key) {
                        var i = String.raw(Z || (Z = Ge(["", ""], ["", ""])), n.textContent).replace(/\\\|/g, "").trim(),
                            o = i.split("|");
                        if (i.startsWith("|") && i.endsWith("|") && o.length > 3) {
                            var a = o.map((function () {
                                return "---"
                            })).join("|");
                            return a = n.textContent + "\n" + a.substring(3, a.length - 3) + "\n|<wbr>", n.outerHTML = t.lute.SpinVditorDOM(a), (0, D.ib)(t[t.currentMode].element, r), dt(t), Ae(t), e.preventDefault(), !0
                        }
                        if (lt(n.innerHTML) && n.previousElementSibling) {
                            var l = "", s = n.innerHTML.trimRight().split("\n");
                            return s.length > 1 && (s.pop(), l = '<p data-block="0">' + s.join("\n") + "</p>"), n.insertAdjacentHTML("afterend", l + '<hr data-block="0"><p data-block="0"><wbr>\n</p>'), n.remove(), (0, D.ib)(t[t.currentMode].element, r), dt(t), Ae(t), e.preventDefault(), !0
                        }
                        if (st(n.innerHTML)) return "wysiwyg" === t.currentMode ? n.outerHTML = t.lute.SpinVditorDOM(n.innerHTML + '<p data-block="0"><wbr>\n</p>') : n.outerHTML = t.lute.SpinVditorIRDOM(n.innerHTML + '<p data-block="0"><wbr>\n</p>'), (0, D.ib)(t[t.currentMode].element, r), dt(t), Ae(t), e.preventDefault(), !0
                    }
                    if (r.collapsed && n.previousElementSibling && "Backspace" === e.key && !(0, d.yl)(e) && !e.altKey && !e.shiftKey && n.textContent.trimRight().split("\n").length > 1 && 0 === (0, D.im)(n, t[t.currentMode].element, r).start) {
                        var c = (0, y.DX)(n.previousElementSibling);
                        return c.textContent.endsWith("\n") || (c.textContent = c.textContent + "\n"), c.parentElement.insertAdjacentHTML("beforeend", "<wbr>" + n.innerHTML), n.remove(), (0, D.ib)(t[t.currentMode].element, r), !1
                    }
                    return !1
                }
            }, mt = function (e, t, n) {
                for (var r = "", i = 0; i < n.parentElement.childElementCount; i++) r += '<td align="' + n.parentElement.children[i].getAttribute("align") + '"> </td>';
                "TH" === n.tagName ? n.parentElement.parentElement.insertAdjacentHTML("afterend", "<tbody><tr>" + r + "</tr></tbody>") : n.parentElement.insertAdjacentHTML("afterend", "<tr>" + r + "</tr>"), dt(e)
            }, ft = function (e, t, n) {
                for (var r = "", i = 0; i < n.parentElement.childElementCount; i++) "TH" === n.tagName ? r += '<th align="' + n.parentElement.children[i].getAttribute("align") + '"> </th>' : r += '<td align="' + n.parentElement.children[i].getAttribute("align") + '"> </td>';
                if ("TH" === n.tagName) {
                    n.parentElement.parentElement.insertAdjacentHTML("beforebegin", "<thead><tr>" + r + "</tr></thead>"), t.insertNode(document.createElement("wbr"));
                    var o = n.parentElement.innerHTML.replace(/<th>/g, "<td>").replace(/<\/th>/g, "</td>");
                    n.parentElement.parentElement.nextElementSibling.insertAdjacentHTML("afterbegin", o), n.parentElement.parentElement.remove(), (0, D.ib)(e.ir.element, t)
                } else n.parentElement.insertAdjacentHTML("beforebegin", "<tr>" + r + "</tr>");
                dt(e)
            }, ht = function (e, t, n, r) {
                void 0 === r && (r = "afterend");
                for (var i = 0, o = n.previousElementSibling; o;) i++, o = o.previousElementSibling;
                for (var a = 0; a < t.rows.length; a++) 0 === a ? t.rows[a].cells[i].insertAdjacentHTML(r, "<th> </th>") : t.rows[a].cells[i].insertAdjacentHTML(r, "<td> </td>");
                dt(e)
            }, vt = function (e, t, n) {
                if ("TD" === n.tagName) {
                    var r = n.parentElement.parentElement;
                    n.parentElement.previousElementSibling ? t.selectNodeContents(n.parentElement.previousElementSibling.lastElementChild) : t.selectNodeContents(r.previousElementSibling.lastElementChild.lastElementChild), 1 === r.childElementCount ? r.remove() : n.parentElement.remove(), t.collapse(!1), (0, D.Hc)(t), dt(e)
                }
            }, gt = function (e, t, n, r) {
                for (var i = 0, o = r.previousElementSibling; o;) i++, o = o.previousElementSibling;
                (r.previousElementSibling || r.nextElementSibling) && (t.selectNodeContents(r.previousElementSibling || r.nextElementSibling), t.collapse(!0));
                for (var a = 0; a < n.rows.length; a++) {
                    var l = n.rows[a].cells;
                    if (1 === l.length) {
                        n.remove(), fe(e);
                        break
                    }
                    l[i].remove()
                }
                (0, D.Hc)(t), dt(e)
            }, yt = function (e, t, n) {
                var r = n.startContainer, i = (0, y.lG)(r, "TD") || (0, y.lG)(r, "TH");
                if (i) {
                    if (!(0, d.yl)(t) && !t.altKey && "Enter" === t.key) {
                        i.lastElementChild && (!i.lastElementChild || i.lastElementChild.isSameNode(i.lastChild) && "BR" === i.lastElementChild.tagName) || i.insertAdjacentHTML("beforeend", "<br>");
                        var o = document.createElement("br");
                        return n.insertNode(o), n.setStartAfter(o), dt(e), Ae(e), t.preventDefault(), !0
                    }
                    if ("Tab" === t.key) return t.shiftKey ? (et(i, n), t.preventDefault(), !0) : ((u = i.nextElementSibling) || (u = i.parentElement.nextElementSibling ? i.parentElement.nextElementSibling.firstElementChild : "THEAD" === i.parentElement.parentElement.tagName && i.parentElement.parentElement.nextElementSibling ? i.parentElement.parentElement.nextElementSibling.firstElementChild.firstElementChild : null), u && (n.selectNodeContents(u), (0, D.Hc)(n)), t.preventDefault(), !0);
                    var a = i.parentElement.parentElement.parentElement;
                    if ("ArrowUp" === t.key) {
                        if (t.preventDefault(), "TH" === i.tagName) return a.previousElementSibling ? (n.selectNodeContents(a.previousElementSibling), n.collapse(!1), (0, D.Hc)(n)) : Ye(e, "beforebegin"), !0;
                        for (var l = 0, s = i.parentElement; l < s.cells.length && !s.cells[l].isSameNode(i); l++) ;
                        var c = s.previousElementSibling;
                        return c || (c = s.parentElement.previousElementSibling.firstChild), n.selectNodeContents(c.cells[l]), n.collapse(!1), (0, D.Hc)(n), !0
                    }
                    if ("ArrowDown" === t.key) {
                        var u;
                        if (t.preventDefault(), !(s = i.parentElement).nextElementSibling && "TD" === i.tagName) return a.nextElementSibling ? (n.selectNodeContents(a.nextElementSibling), n.collapse(!0), (0, D.Hc)(n)) : Ye(e, "afterend"), !0;
                        for (l = 0; l < s.cells.length && !s.cells[l].isSameNode(i); l++) ;
                        return (u = s.nextElementSibling) || (u = s.parentElement.nextElementSibling.firstChild), n.selectNodeContents(u.cells[l]), n.collapse(!0), (0, D.Hc)(n), !0
                    }
                    if ("wysiwyg" === e.currentMode && !(0, d.yl)(t) && "Enter" === t.key && !t.shiftKey && t.altKey) {
                        var p = e.wysiwyg.popover.querySelector(".vditor-input");
                        return p.focus(), p.select(), t.preventDefault(), !0
                    }
                    if (!(0, d.yl)(t) && !t.shiftKey && !t.altKey && "Backspace" === t.key && 0 === n.startOffset && "" === n.toString()) return !et(i, n, !1) && a && ("" === a.textContent.trim() ? (a.outerHTML = '<p data-block="0"><wbr>\n</p>', (0, D.ib)(e[e.currentMode].element, n)) : (n.setStartBefore(a), n.collapse(!0)), dt(e)), t.preventDefault(), !0;
                    if (P("⇧⌘F", t)) return ft(e, n, i), t.preventDefault(), !0;
                    if (P("⌘=", t)) return mt(e, n, i), t.preventDefault(), !0;
                    if (P("⇧⌘G", t)) return ht(e, a, i, "beforebegin"), t.preventDefault(), !0;
                    if (P("⇧⌘=", t)) return ht(e, a, i), t.preventDefault(), !0;
                    if (P("⌘-", t)) return vt(e, n, i), t.preventDefault(), !0;
                    if (P("⇧⌘-", t)) return gt(e, n, a, i), t.preventDefault(), !0;
                    if (P("⇧⌘L", t)) {
                        if ("ir" === e.currentMode) return at(a, "left"), dt(e), t.preventDefault(), !0;
                        if (m = e.wysiwyg.popover.querySelector('[data-type="left"]')) return m.click(), t.preventDefault(), !0
                    }
                    if (P("⇧⌘C", t)) {
                        if ("ir" === e.currentMode) return at(a, "center"), dt(e), t.preventDefault(), !0;
                        if (m = e.wysiwyg.popover.querySelector('[data-type="center"]')) return m.click(), t.preventDefault(), !0
                    }
                    if (P("⇧⌘R", t)) {
                        if ("ir" === e.currentMode) return at(a, "right"), dt(e), t.preventDefault(), !0;
                        var m;
                        if (m = e.wysiwyg.popover.querySelector('[data-type="right"]')) return m.click(), t.preventDefault(), !0
                    }
                }
                return !1
            }, bt = function (e, t, n, r) {
                if ("PRE" === n.tagName && P("⌘A", t)) return r.selectNodeContents(n.firstElementChild), t.preventDefault(), !0;
                if (e.options.tab && "Tab" === t.key && !t.shiftKey && "" === r.toString()) return r.insertNode(document.createTextNode(e.options.tab)), r.collapse(!1), dt(e), t.preventDefault(), !0;
                if ("Backspace" === t.key && !(0, d.yl)(t) && !t.shiftKey && !t.altKey) {
                    var i = (0, D.im)(n, e[e.currentMode].element, r);
                    if ((0 === i.start || 1 === i.start && "\n" === n.innerText) && "" === r.toString()) return n.parentElement.outerHTML = '<p data-block="0"><wbr>' + n.firstElementChild.innerHTML + "</p>", (0, D.ib)(e[e.currentMode].element, r), dt(e), t.preventDefault(), !0
                }
                return !(0, d.yl)(t) && !t.altKey && "Enter" === t.key && (n.firstElementChild.textContent.endsWith("\n") || n.firstElementChild.insertAdjacentText("beforeend", "\n"), r.extractContents(), r.insertNode(document.createTextNode("\n")), r.collapse(!1), (0, D.Hc)(r), (0, d.vU)() || ("wysiwyg" === e.currentMode ? ze(e, r) : R(e, r)), Ae(e), t.preventDefault(), !0)
            }, wt = function (e, t, n, r) {
                var o = t.startContainer, a = (0, y.lG)(o, "BLOCKQUOTE");
                if (a && "" === t.toString()) {
                    if ("Backspace" === n.key && !(0, d.yl)(n) && !n.shiftKey && !n.altKey && 0 === (0, D.im)(a, e[e.currentMode].element, t).start) return t.insertNode(document.createElement("wbr")), a.outerHTML = a.innerHTML, (0, D.ib)(e[e.currentMode].element, t), dt(e), n.preventDefault(), !0;
                    if (r && "Enter" === n.key && !(0, d.yl)(n) && !n.shiftKey && !n.altKey && "BLOCKQUOTE" === r.parentElement.tagName) {
                        var l = !1;
                        if ("\n" === r.innerHTML.replace(i.g.ZWSP, "") || "" === r.innerHTML.replace(i.g.ZWSP, "") ? (l = !0, r.remove()) : r.innerHTML.endsWith("\n\n") && (0, D.im)(r, e[e.currentMode].element, t).start === r.textContent.length - 1 && (r.innerHTML = r.innerHTML.substr(0, r.innerHTML.length - 2), l = !0), l) return a.insertAdjacentHTML("afterend", '<p data-block="0">' + i.g.ZWSP + "<wbr>\n</p>"), (0, D.ib)(e[e.currentMode].element, t), dt(e), n.preventDefault(), !0
                    }
                    var s = (0, y.F9)(o);
                    if ("wysiwyg" === e.currentMode && s && P("⇧⌘;", n)) return t.insertNode(document.createElement("wbr")), s.outerHTML = '<blockquote data-block="0">' + s.outerHTML + "</blockquote>", (0, D.ib)(e.wysiwyg.element, t), Y(e), n.preventDefault(), !0;
                    if (tt(e, n, t, a, a)) return !0;
                    if (nt(e, n, t, a, a)) return !0
                }
                return !1
            }, Et = function (e, t, n) {
                var r = t.startContainer, i = (0, y.fb)(r, "vditor-task");
                if (i) {
                    if (P("⇧⌘J", n)) {
                        var o = i.firstElementChild;
                        return o.checked ? o.removeAttribute("checked") : o.setAttribute("checked", "checked"), dt(e), n.preventDefault(), !0
                    }
                    if ("Backspace" === n.key && !(0, d.yl)(n) && !n.shiftKey && !n.altKey && "" === t.toString() && 1 === t.startOffset && (3 === r.nodeType && r.previousSibling && "INPUT" === r.previousSibling.tagName || 3 !== r.nodeType)) {
                        var a = i.previousElementSibling;
                        if (i.querySelector("input").remove(), a) (0, y.DX)(a).parentElement.insertAdjacentHTML("beforeend", "<wbr>" + i.innerHTML.trim()), i.remove(); else i.parentElement.insertAdjacentHTML("beforebegin", '<p data-block="0"><wbr>' + (i.innerHTML.trim() || "\n") + "</p>"), i.nextElementSibling ? i.remove() : i.parentElement.remove();
                        return (0, D.ib)(e[e.currentMode].element, t), dt(e), n.preventDefault(), !0
                    }
                    if ("Enter" === n.key && !(0, d.yl)(n) && !n.shiftKey && !n.altKey) {
                        if ("" === i.textContent.trim()) if ((0, y.fb)(i.parentElement, "vditor-task")) {
                            var l = (0, y.O9)(r);
                            l && ot(e, i, t, l)
                        } else if (i.nextElementSibling) {
                            var s = "", c = "", u = !1;
                            Array.from(i.parentElement.children).forEach((function (e) {
                                i.isSameNode(e) ? u = !0 : u ? s += e.outerHTML : c += e.outerHTML
                            }));
                            var p = i.parentElement.tagName,
                                m = "OL" === i.parentElement.tagName ? "" : ' data-marker="' + i.parentElement.getAttribute("data-marker") + '"',
                                f = "";
                            c && (f = "UL" === i.parentElement.tagName ? "" : ' start="1"', c = "<" + p + ' data-tight="true"' + m + ' data-block="0">' + c + "</" + p + ">"), i.parentElement.outerHTML = c + '<p data-block="0"><wbr>\n</p><' + p + '\n data-tight="true"' + m + ' data-block="0"' + f + ">" + s + "</" + p + ">"
                        } else i.parentElement.insertAdjacentHTML("afterend", '<p data-block="0"><wbr>\n</p>'), 1 === i.parentElement.querySelectorAll("li").length ? i.parentElement.remove() : i.remove(); else 3 !== r.nodeType && 0 === t.startOffset && "INPUT" === r.firstChild.tagName ? t.setStart(r.childNodes[1], 1) : (t.setEndAfter(i.lastChild), i.insertAdjacentHTML("afterend", '<li class="vditor-task" data-marker="' + i.getAttribute("data-marker") + '"><input type="checkbox"> <wbr></li>'), document.querySelector("wbr").after(t.extractContents()));
                        return (0, D.ib)(e[e.currentMode].element, t), dt(e), Ae(e), n.preventDefault(), !0
                    }
                }
                return !1
            }, kt = function (e, t, n, r) {
                if (3 !== t.startContainer.nodeType) {
                    var i = t.startContainer.children[t.startOffset];
                    if (i && "HR" === i.tagName) return t.selectNodeContents(i.previousElementSibling), t.collapse(!1), n.preventDefault(), !0
                }
                if (r) {
                    var o = r.previousElementSibling;
                    if (o && 0 === (0, D.im)(r, e[e.currentMode].element, t).start && ((0, d.vU)() && "HR" === o.tagName || "TABLE" === o.tagName)) {
                        if ("TABLE" === o.tagName) {
                            var a = o.lastElementChild.lastElementChild.lastElementChild;
                            a.innerHTML = a.innerHTML.trimLeft() + "<wbr>" + r.textContent.trim(), r.remove()
                        } else o.remove();
                        return (0, D.ib)(e[e.currentMode].element, t), dt(e), n.preventDefault(), !0
                    }
                }
                return !1
            }, St = function (e) {
                (0, d.vU)() && 3 !== e.startContainer.nodeType && "HR" === e.startContainer.tagName && e.setStartBefore(e.startContainer)
            }, Lt = function (e, t, n) {
                var r, i;
                if (!(0, d.vU)()) return !1;
                if ("ArrowUp" === e.key && t && "TABLE" === (null === (r = t.previousElementSibling) || void 0 === r ? void 0 : r.tagName)) {
                    var o = t.previousElementSibling;
                    return n.selectNodeContents(o.rows[o.rows.length - 1].lastElementChild), n.collapse(!1), e.preventDefault(), !0
                }
                return !("ArrowDown" !== e.key || !t || "TABLE" !== (null === (i = t.nextElementSibling) || void 0 === i ? void 0 : i.tagName)) && (n.selectNodeContents(t.nextElementSibling.rows[0].cells[0]), n.collapse(!0), e.preventDefault(), !0)
            }, Ct = function (e, t, n) {
                return Ke(void 0, void 0, void 0, (function () {
                    var r, o, a, l, s, d, c, u, p, m, f, h, v, g, b, w;
                    return Fe(this, (function (E) {
                        switch (E.label) {
                            case 0:
                                return "true" !== e[e.currentMode].element.getAttribute("contenteditable") ? [2] : (t.stopPropagation(), t.preventDefault(), "clipboardData" in t ? (r = t.clipboardData.getData("text/html"), o = t.clipboardData.getData("text/plain"), a = t.clipboardData.files) : (r = t.dataTransfer.getData("text/html"), o = t.dataTransfer.getData("text/plain"), t.dataTransfer.types.includes("Files") && (a = t.dataTransfer.items)), l = {}, s = function (t, n) {
                                    if (!n) return ["", Lute.WalkContinue];
                                    var r = t.TokensStr();
                                    if (34 === t.__internal_object__.Parent.Type && r && -1 === r.indexOf("file://") && e.options.upload.linkToImgUrl) {
                                        var i = new XMLHttpRequest;
                                        i.open("POST", e.options.upload.linkToImgUrl), e.options.upload.token && i.setRequestHeader("X-Upload-Token", e.options.upload.token), e.options.upload.withCredentials && (i.withCredentials = !0), qe(e, i), i.setRequestHeader("Content-Type", "application/json; charset=utf-8"), i.onreadystatechange = function () {
                                            if (i.readyState === XMLHttpRequest.DONE) {
                                                if (200 === i.status) {
                                                    var t = i.responseText;
                                                    e.options.upload.linkToImgFormat && (t = e.options.upload.linkToImgFormat(i.responseText));
                                                    var n = JSON.parse(t);
                                                    if (0 !== n.code) return void e.tip.show(n.msg);
                                                    var r = n.data.originalURL;
                                                    if ("sv" === e.currentMode) e.sv.element.querySelectorAll(".vditor-sv__marker--link").forEach((function (e) {
                                                        e.textContent === r && (e.textContent = n.data.url)
                                                    })); else {
                                                        var o = e[e.currentMode].element.querySelector('images[src="' + r + '"]');
                                                        o.src = n.data.url, "ir" === e.currentMode && (o.previousElementSibling.previousElementSibling.innerHTML = n.data.url)
                                                    }
                                                    dt(e)
                                                } else e.tip.show(i.responseText);
                                                e.options.upload.linkToImgCallback && e.options.upload.linkToImgCallback(i.responseText)
                                            }
                                        }, i.send(JSON.stringify({url: r}))
                                    }
                                    return "ir" === e.currentMode ? ['<span class="vditor-ir__marker vditor-ir__marker--link">' + Lute.EscapeHTMLStr(r) + "</span>", Lute.WalkContinue] : "wysiwyg" === e.currentMode ? ["", Lute.WalkContinue] : ['<span class="vditor-sv__marker--link">' + Lute.EscapeHTMLStr(r) + "</span>", Lute.WalkContinue]
                                }, r.replace(/&amp;/g, "&").replace(/<(|\/)(html|body|meta)[^>]*?>/gi, "").trim() !== '<a href="' + o + '">' + o + "</a>" && r.replace(/&amp;/g, "&").replace(/<(|\/)(html|body|meta)[^>]*?>/gi, "").trim() !== '\x3c!--StartFragment--\x3e<a href="' + o + '">' + o + "</a>\x3c!--EndFragment--\x3e" || (r = ""), (d = (new DOMParser).parseFromString(r, "text/html")).body && (r = d.body.innerHTML), r = Lute.Sanitize(r), e.wysiwyg.getComments(e), c = e[e.currentMode].element.scrollHeight, u = function (e, t, n) {
                                    void 0 === n && (n = "sv");
                                    var r = document.createElement("div");
                                    r.innerHTML = e;
                                    var i = !1;
                                    1 === r.childElementCount && r.lastElementChild.style.fontFamily.indexOf("monospace") > -1 && (i = !0);
                                    var o = r.querySelectorAll("pre");
                                    if (1 === r.childElementCount && 1 === o.length && "vditor-wysiwyg" !== o[0].className && "vditor-sv" !== o[0].className && (i = !0), 0 === e.indexOf('\n<p class="p1">') && (i = !0), 1 === r.childElementCount && "TABLE" === r.firstElementChild.tagName && r.querySelector(".line-number") && r.querySelector(".line-content") && (i = !0), i) {
                                        var a = t || e;
                                        return /\n/.test(a) || 1 === o.length ? "wysiwyg" === n ? '<div class="vditor-wysiwyg__block" data-block="0" data-type="code-block"><pre><code>' + a.replace(/&/g, "&amp;").replace(/</g, "&lt;") + "<wbr></code></pre></div>" : "\n```\n" + a.replace(/&/g, "&amp;").replace(/</g, "&lt;") + "\n```" : "wysiwyg" === n ? "<code>" + a.replace(/&/g, "&amp;").replace(/</g, "&lt;") + "</code><wbr>" : "`" + a + "`"
                                    }
                                    return !1
                                }(r, o, e.currentMode), (p = "sv" === e.currentMode ? (0, y.a1)(t.target, "data-type", "code-block") : (0, y.lG)(t.target, "CODE")) ? ("sv" === e.currentMode ? document.execCommand("insertHTML", !1, o.replace(/&/g, "&amp;").replace(/</g, "&lt;")) : (m = (0, D.im)(t.target, e[e.currentMode].element), "PRE" !== p.parentElement.tagName && (o += i.g.ZWSP), p.textContent = p.textContent.substring(0, m.start) + o + p.textContent.substring(m.end), (0, D.$j)(m.start + o.length, m.start + o.length, p.parentElement), (null === (w = p.parentElement) || void 0 === w ? void 0 : w.nextElementSibling.classList.contains("vditor-" + e.currentMode + "__preview")) && (p.parentElement.nextElementSibling.innerHTML = p.outerHTML, N(p.parentElement.nextElementSibling, e))), [3, 8]) : [3, 1]);
                            case 1:
                                return u ? (n.pasteCode(u), [3, 8]) : [3, 2];
                            case 2:
                                return "" === r.trim() ? [3, 3] : ((f = document.createElement("div")).innerHTML = r, f.querySelectorAll("[style]").forEach((function (e) {
                                    e.removeAttribute("style")
                                })), f.querySelectorAll(".vditor-copy").forEach((function (e) {
                                    e.remove()
                                })), "ir" === e.currentMode ? (l.HTML2VditorIRDOM = {renderLinkDest: s}, e.lute.SetJSRenderers({renderers: l}), (0, D.oC)(e.lute.HTML2VditorIRDOM(f.innerHTML), e)) : "wysiwyg" === e.currentMode ? (l.HTML2VditorDOM = {renderLinkDest: s}, e.lute.SetJSRenderers({renderers: l}), (0, D.oC)(e.lute.HTML2VditorDOM(f.innerHTML), e)) : (l.Md2VditorSVDOM = {renderLinkDest: s}, e.lute.SetJSRenderers({renderers: l}), He(e, e.lute.HTML2Md(f.innerHTML).trimRight())), e.outline.render(e), [3, 8]);
                            case 3:
                                return a.length > 0 ? e.options.upload.url || e.options.upload.handler ? [4, We(e, a)] : [3, 5] : [3, 7];
                            case 4:
                                return E.sent(), [3, 6];
                            case 5:
                                h = new FileReader, "clipboardData" in t ? (a = t.clipboardData.files, v = a[0]) : t.dataTransfer.types.includes("Files") && (a = t.dataTransfer.items, v = a[0].getAsFile()), v && v.type.startsWith("image") && (h.readAsDataURL(v), h.onload = function () {
                                    var t = "";
                                    "wysiwyg" === e.currentMode ? t += '<images alt="' + v.name + '" src="' + h.result.toString() + '">\n' : t += "![" + v.name + "](" + h.result.toString() + ")\n", document.execCommand("insertHTML", !1, t)
                                }), E.label = 6;
                            case 6:
                                return [3, 8];
                            case 7:
                                "" !== o.trim() && 0 === a.length && ("" !== (b = (0, D.zh)(e)).toString() && e.lute.IsValidLinkDest(o) && (o = "[" + b.toString() + "](" + o + ")"), "ir" === e.currentMode ? (l.Md2VditorIRDOM = {renderLinkDest: s}, e.lute.SetJSRenderers({renderers: l}), (0, D.oC)(e.lute.Md2VditorIRDOM(o), e)) : "wysiwyg" === e.currentMode ? (l.Md2VditorDOM = {renderLinkDest: s}, e.lute.SetJSRenderers({renderers: l}), (0, D.oC)(e.lute.Md2VditorDOM(o), e)) : (l.Md2VditorSVDOM = {renderLinkDest: s}, e.lute.SetJSRenderers({renderers: l}), He(e, o)), e.outline.render(e)), E.label = 8;
                            case 8:
                                return "sv" !== e.currentMode && ((g = (0, y.F9)((0, D.zh)(e).startContainer)) && (b = (0, D.zh)(e), e[e.currentMode].element.querySelectorAll("wbr").forEach((function (e) {
                                    e.remove()
                                })), b.insertNode(document.createElement("wbr")), "wysiwyg" === e.currentMode ? g.outerHTML = e.lute.SpinVditorDOM(g.outerHTML) : g.outerHTML = e.lute.SpinVditorIRDOM(g.outerHTML), (0, D.ib)(e[e.currentMode].element, b)), e[e.currentMode].element.querySelectorAll(".vditor-" + e.currentMode + "__preview[data-render='2']").forEach((function (t) {
                                    N(t, e)
                                }))), e.wysiwyg.triggerRemoveComment(e), dt(e), e[e.currentMode].element.scrollHeight - c > Math.min(e[e.currentMode].element.clientHeight, window.innerHeight) / 2 && Ae(e), [2]
                        }
                    }))
                }))
            }, Tt = function (e) {
                e.hint.render(e);
                var t = (0, D.zh)(e).startContainer, n = (0, y.a1)(t, "data-type", "code-block-info");
                if (n) if ("" === n.textContent.replace(i.g.ZWSP, "") && e.hint.recentLanguage) {
                    n.textContent = i.g.ZWSP + e.hint.recentLanguage, (0, D.zh)(e).selectNodeContents(n)
                } else {
                    var r = [], o = n.textContent.substring(0, (0, D.im)(n, e.ir.element).start).replace(i.g.ZWSP, "");
                    i.g.CODE_LANGUAGES.forEach((function (e) {
                        e.indexOf(o.toLowerCase()) > -1 && r.push({html: e, value: e})
                    })), e.hint.genHTML(r, o, e)
                }
            }, Mt = function (e, t) {
                void 0 === t && (t = {
                    enableAddUndoStack: !0,
                    enableHint: !1,
                    enableInput: !0
                }), t.enableHint && Tt(e), clearTimeout(e.ir.processTimeoutId), e.ir.processTimeoutId = window.setTimeout((function () {
                    if (!e.ir.composingLock) {
                        var n = a(e);
                        "function" == typeof e.options.input && t.enableInput && e.options.input(n), e.options.counter.enable && e.counter.render(e, n), e.options.cache.enable && (0, d.pK)() && (localStorage.setItem(e.options.cache.id, n), e.options.cache.after && e.options.cache.after(n)), e.devtools && e.devtools.renderEchart(e), t.enableAddUndoStack && e.undo.addToUndoStack(e)
                    }
                }), e.options.undoDelay)
            }, At = function (e, t) {
                var n = (0, D.zh)(e), r = (0, y.F9)(n.startContainer) || n.startContainer;
                if (r) {
                    var i = r.querySelector(".vditor-ir__marker--heading");
                    i ? i.innerHTML = t : (r.insertAdjacentText("afterbegin", t), n.selectNodeContents(r), n.collapse(!1)), R(e, n.cloneRange()), X(e)
                }
            }, _t = function (e, t, n) {
                var r = (0, y.a1)(e.startContainer, "data-type", n);
                if (r) {
                    r.firstElementChild.remove(), r.lastElementChild.remove(), e.insertNode(document.createElement("wbr"));
                    var i = document.createElement("div");
                    i.innerHTML = t.lute.SpinVditorIRDOM(r.outerHTML), r.outerHTML = i.firstElementChild.innerHTML.trim()
                }
            }, xt = function (e, t, n, r) {
                var i = (0, D.zh)(e), o = t.getAttribute("data-type"), a = i.startContainer;
                3 === a.nodeType && (a = a.parentElement);
                var l = !0;
                if (t.classList.contains("vditor-menu--current")) if ("quote" === o) {
                    var s = (0, y.lG)(a, "BLOCKQUOTE");
                    s && (i.insertNode(document.createElement("wbr")), s.outerHTML = "" === s.innerHTML.trim() ? '<p data-block="0">' + s.innerHTML + "</p>" : s.innerHTML)
                } else if ("link" === o) {
                    var d = (0, y.a1)(i.startContainer, "data-type", "a");
                    if (d) {
                        var u = (0, y.fb)(i.startContainer, "vditor-ir__link");
                        u ? (i.insertNode(document.createElement("wbr")), d.outerHTML = u.innerHTML) : d.outerHTML = d.querySelector(".vditor-ir__link").innerHTML + "<wbr>"
                    }
                } else "italic" === o ? _t(i, e, "em") : "bold" === o ? _t(i, e, "strong") : "strike" === o ? _t(i, e, "s") : "inline-code" === o ? _t(i, e, "code") : "check" !== o && "list" !== o && "ordered-list" !== o || (rt(e, i, o), l = !1, t.classList.remove("vditor-menu--current")); else {
                    0 === e.ir.element.childNodes.length && (e.ir.element.innerHTML = '<p data-block="0"><wbr></p>', (0, D.ib)(e.ir.element, i));
                    var p = (0, y.F9)(i.startContainer);
                    if ("line" === o) {
                        if (p) {
                            var m = '<hr data-block="0"><p data-block="0"><wbr>\n</p>';
                            "" === p.innerHTML.trim() ? p.outerHTML = m : p.insertAdjacentHTML("afterend", m)
                        }
                    } else if ("quote" === o) p && (i.insertNode(document.createElement("wbr")), p.outerHTML = '<blockquote data-block="0">' + p.outerHTML + "</blockquote>", l = !1, t.classList.add("vditor-menu--current")); else if ("link" === o) {
                        var f = void 0;
                        f = "" === i.toString() ? n + "<wbr>" + r : "" + n + i.toString() + r.replace(")", "<wbr>)"), document.execCommand("insertHTML", !1, f), l = !1, t.classList.add("vditor-menu--current")
                    } else if ("italic" === o || "bold" === o || "strike" === o || "inline-code" === o || "code" === o || "table" === o) {
                        f = void 0;
                        "" === i.toString() ? f = n + "<wbr>" + r : (f = "code" === o ? n + "\n" + i.toString() + "<wbr>" + r : "table" === o ? "" + n + i.toString() + "<wbr>" + r : "" + n + i.toString() + r + "<wbr>", i.deleteContents()), "table" !== o && "code" !== o || (f = "\n" + f + "\n\n");
                        var h = document.createElement("span");
                        h.innerHTML = f, i.insertNode(h), R(e, i), "table" === o && (i.selectNodeContents(getSelection().getRangeAt(0).startContainer.parentElement), (0, D.Hc)(i))
                    } else "check" !== o && "list" !== o && "ordered-list" !== o || (rt(e, i, o, !1), l = !1, c(e.toolbar.elements, ["check", "list", "ordered-list"]), t.classList.add("vditor-menu--current"))
                }
                (0, D.ib)(e.ir.element, i), Mt(e), l && X(e)
            }, Ht = function (e, t, n, r) {
                return new (n || (n = Promise))((function (i, o) {
                    function a(e) {
                        try {
                            s(r.next(e))
                        } catch (e) {
                            o(e)
                        }
                    }

                    function l(e) {
                        try {
                            s(r.throw(e))
                        } catch (e) {
                            o(e)
                        }
                    }

                    function s(e) {
                        var t;
                        e.done ? i(e.value) : (t = e.value, t instanceof n ? t : new n((function (e) {
                            e(t)
                        }))).then(a, l)
                    }

                    s((r = r.apply(e, t || [])).next())
                }))
            }, Nt = function (e, t) {
                var n, r, i, o, a = {
                    label: 0, sent: function () {
                        if (1 & i[0]) throw i[1];
                        return i[1]
                    }, trys: [], ops: []
                };
                return o = {
                    next: l(0),
                    throw: l(1),
                    return: l(2)
                }, "function" == typeof Symbol && (o[Symbol.iterator] = function () {
                    return this
                }), o;

                function l(o) {
                    return function (l) {
                        return function (o) {
                            if (n) throw new TypeError("Generator is already executing.");
                            for (; a;) try {
                                if (n = 1, r && (i = 2 & o[0] ? r.return : o[0] ? r.throw || ((i = r.return) && i.call(r), 0) : r.next) && !(i = i.call(r, o[1])).done) return i;
                                switch (r = 0, i && (o = [2 & o[0], i.value]), o[0]) {
                                    case 0:
                                    case 1:
                                        i = o;
                                        break;
                                    case 4:
                                        return a.label++, {value: o[1], done: !1};
                                    case 5:
                                        a.label++, r = o[1], o = [0];
                                        continue;
                                    case 7:
                                        o = a.ops.pop(), a.trys.pop();
                                        continue;
                                    default:
                                        if (!(i = a.trys, (i = i.length > 0 && i[i.length - 1]) || 6 !== o[0] && 2 !== o[0])) {
                                            a = 0;
                                            continue
                                        }
                                        if (3 === o[0] && (!i || o[1] > i[0] && o[1] < i[3])) {
                                            a.label = o[1];
                                            break
                                        }
                                        if (6 === o[0] && a.label < i[1]) {
                                            a.label = i[1], i = o;
                                            break
                                        }
                                        if (i && a.label < i[2]) {
                                            a.label = i[2], a.ops.push(o);
                                            break
                                        }
                                        i[2] && a.ops.pop(), a.trys.pop();
                                        continue
                                }
                                o = t.call(e, a)
                            } catch (e) {
                                o = [6, e], r = 0
                            } finally {
                                n = i = 0
                            }
                            if (5 & o[0]) throw o[1];
                            return {value: o[0] ? o[1] : void 0, done: !0}
                        }([o, l])
                    }
                }
            }, Dt = function () {
                function e(e) {
                    var t = this;
                    this.splitChar = "", this.lastIndex = -1, this.fillEmoji = function (e, n) {
                        t.element.style.display = "none";
                        var r = decodeURIComponent(e.getAttribute("data-value")),
                            o = window.getSelection().getRangeAt(0);
                        if ("ir" === n.currentMode) {
                            var a = (0, y.a1)(o.startContainer, "data-type", "code-block-info");
                            if (a) return a.textContent = i.g.ZWSP + r.trimRight(), o.selectNodeContents(a), o.collapse(!1), Mt(n), a.parentElement.querySelectorAll("code").forEach((function (e) {
                                e.className = "language-" + r.trimRight()
                            })), N(a.parentElement.querySelector(".vditor-ir__preview"), n), void (t.recentLanguage = r.trimRight())
                        }
                        if ("wysiwyg" === n.currentMode && 3 !== o.startContainer.nodeType) {
                            var l = o.startContainer, s = void 0;
                            if ((s = l.classList.contains("vditor-input") ? l : l.firstElementChild) && s.classList.contains("vditor-input")) return s.value = r.trimRight(), o.selectNodeContents(s), o.collapse(!1), s.dispatchEvent(new CustomEvent("input", {detail: 1})), void (t.recentLanguage = r.trimRight())
                        }
                        if (o.setStart(o.startContainer, t.lastIndex), o.deleteContents(), n.options.hint.parse ? "sv" === n.currentMode ? (0, D.oC)(n.lute.SpinVditorSVDOM(r), n) : "wysiwyg" === n.currentMode ? (0, D.oC)(n.lute.SpinVditorDOM(r), n) : (0, D.oC)(n.lute.SpinVditorIRDOM(r), n) : (0, D.oC)(r, n), ":" === t.splitChar && r.indexOf(":") > -1 && "sv" !== n.currentMode && o.insertNode(document.createTextNode(" ")), o.collapse(!1), (0, D.Hc)(o), "wysiwyg" === n.currentMode) (d = (0, y.fb)(o.startContainer, "vditor-wysiwyg__block")) && d.lastElementChild.classList.contains("vditor-wysiwyg__preview") && (d.lastElementChild.innerHTML = d.firstElementChild.innerHTML, N(d.lastElementChild, n)); else if ("ir" === n.currentMode) {
                            var d;
                            (d = (0, y.fb)(o.startContainer, "vditor-ir__marker--pre")) && d.nextElementSibling.classList.contains("vditor-ir__preview") && (d.nextElementSibling.innerHTML = d.innerHTML, N(d.nextElementSibling, n))
                        }
                        dt(n)
                    }, this.timeId = -1, this.element = document.createElement("div"), this.element.className = "vditor-hint", this.recentLanguage = "", e.push({key: ":"})
                }

                return e.prototype.render = function (e) {
                    var t = this;
                    if (window.getSelection().focusNode) {
                        var n, r = getSelection().getRangeAt(0);
                        n = r.startContainer.textContent.substring(0, r.startOffset) || "";
                        var i = this.getKey(n, e.options.hint.extend);
                        if (void 0 === i) this.element.style.display = "none", clearTimeout(this.timeId); else if (":" === this.splitChar) {
                            var o = "" === i ? e.options.hint.emoji : e.lute.GetEmojis(), a = [];
                            Object.keys(o).forEach((function (e) {
                                0 === e.indexOf(i.toLowerCase()) && (o[e].indexOf(".") > -1 ? a.push({
                                    html: '<images src="' + o[e] + '" title=":' + e + ':"/> :' + e + ":",
                                    value: ":" + e + ":"
                                }) : a.push({
                                    html: '<span class="vditor-hint__emoji">' + o[e] + "</span>" + e,
                                    value: o[e]
                                }))
                            })), this.genHTML(a, i, e)
                        } else e.options.hint.extend.forEach((function (n) {
                            n.key === t.splitChar && (clearTimeout(t.timeId), t.timeId = window.setTimeout((function () {
                                return Ht(t, void 0, void 0, (function () {
                                    var t;
                                    return Nt(this, (function (r) {
                                        switch (r.label) {
                                            case 0:
                                                return t = this.genHTML, [4, n.hint(i)];
                                            case 1:
                                                return t.apply(this, [r.sent(), i, e]), [2]
                                        }
                                    }))
                                }))
                            }), e.options.hint.delay))
                        }))
                    }
                }, e.prototype.genHTML = function (e, t, n) {
                    var r = this;
                    if (0 !== e.length) {
                        var i = n[n.currentMode].element, o = (0, D.Ny)(i),
                            a = o.left + ("left" === n.options.outline.position ? n.outline.element.offsetWidth : 0),
                            l = o.top, s = "";
                        e.forEach((function (e, n) {
                            if (!(n > 7)) {
                                var r = e.html;
                                if ("" !== t) {
                                    var i = r.lastIndexOf(">") + 1, o = r.substr(i),
                                        a = o.toLowerCase().indexOf(t.toLowerCase());
                                    a > -1 && (o = o.substring(0, a) + "<b>" + o.substring(a, a + t.length) + "</b>" + o.substring(a + t.length), r = r.substr(0, i) + o)
                                }
                                s += '<button type="button" data-value="' + encodeURIComponent(e.value) + ' "\n' + (0 === n ? "class='vditor-hint--current'" : "") + "> " + r + "</button>"
                            }
                        })), this.element.innerHTML = s;
                        var d = parseInt(document.defaultView.getComputedStyle(i, null).getPropertyValue("line-height"), 10);
                        this.element.style.top = l + (d || 22) + "px", this.element.style.left = a + "px", this.element.style.display = "block", this.element.style.right = "auto", this.element.querySelectorAll("button").forEach((function (e) {
                            e.addEventListener("click", (function (t) {
                                r.fillEmoji(e, n), t.preventDefault()
                            }))
                        })), this.element.getBoundingClientRect().bottom > window.innerHeight && (this.element.style.top = l - this.element.offsetHeight + "px"), this.element.getBoundingClientRect().right > window.innerWidth && (this.element.style.left = "auto", this.element.style.right = "0")
                    } else this.element.style.display = "none"
                }, e.prototype.select = function (e, t) {
                    if (0 === this.element.querySelectorAll("button").length || "none" === this.element.style.display) return !1;
                    var n = this.element.querySelector(".vditor-hint--current");
                    if ("ArrowDown" === e.key) return e.preventDefault(), e.stopPropagation(), n.removeAttribute("class"), n.nextElementSibling ? n.nextElementSibling.className = "vditor-hint--current" : this.element.children[0].className = "vditor-hint--current", !0;
                    if ("ArrowUp" === e.key) {
                        if (e.preventDefault(), e.stopPropagation(), n.removeAttribute("class"), n.previousElementSibling) n.previousElementSibling.className = "vditor-hint--current"; else {
                            var r = this.element.children.length;
                            this.element.children[r - 1].className = "vditor-hint--current"
                        }
                        return !0
                    }
                    return !((0, d.yl)(e) || e.shiftKey || e.altKey || "Enter" !== e.key || e.isComposing) && (e.preventDefault(), e.stopPropagation(), this.fillEmoji(n, t), !0)
                }, e.prototype.getKey = function (e, t) {
                    var n, r = this;
                    if (this.lastIndex = -1, this.splitChar = "", t.forEach((function (t) {
                        var n = e.lastIndexOf(t.key);
                        r.lastIndex < n && (r.splitChar = t.key, r.lastIndex = n)
                    })), -1 === this.lastIndex) return n;
                    var i = e.split(this.splitChar), a = i[i.length - 1];
                    if (i.length > 1 && a.trim() === a) if (2 === i.length && "" === i[0] && i[1].length < 32) n = i[1]; else {
                        var l = i[i.length - 2].slice(-1);
                        " " === (0, o.X)(l) && a.length < 32 && (n = a)
                    }
                    return n
                }, e
            }(), Ot = function () {
                function e(e) {
                    this.composingLock = !1;
                    var t = document.createElement("div");
                    t.className = "vditor-ir", t.innerHTML = '<pre class="vditor-reset" placeholder="' + e.options.placeholder + '"\n contenteditable="true" spellcheck="false"></pre>', this.element = t.firstElementChild, this.bindEvent(e), ke(e, this.element), Se(e, this.element), Le(e, this.element), _e(e, this.element), xe(e, this.element), Ce(e, this.element), Te(e, this.element, this.copy), Me(e, this.element, this.copy)
                }

                return e.prototype.copy = function (e, t) {
                    var n = getSelection().getRangeAt(0);
                    if ("" !== n.toString()) {
                        e.stopPropagation(), e.preventDefault();
                        var r = document.createElement("div");
                        r.appendChild(n.cloneContents()), e.clipboardData.setData("text/plain", t.lute.VditorIRDOM2Md(r.innerHTML).trim()), e.clipboardData.setData("text/html", "")
                    }
                }, e.prototype.bindEvent = function (e) {
                    var t = this;
                    this.element.addEventListener("paste", (function (t) {
                        Ct(e, t, {
                            pasteCode: function (e) {
                                document.execCommand("insertHTML", !1, e)
                            }
                        })
                    })), this.element.addEventListener("compositionstart", (function (e) {
                        t.composingLock = !0
                    })), this.element.addEventListener("compositionend", (function (n) {
                        (0, d.vU)() || R(e, getSelection().getRangeAt(0).cloneRange()), t.composingLock = !1
                    })), this.element.addEventListener("input", (function (n) {
                        if ("deleteByDrag" !== n.inputType && "insertFromDrop" !== n.inputType) return t.preventInput ? (t.preventInput = !1, void Mt(e, {
                            enableAddUndoStack: !0,
                            enableHint: !0,
                            enableInput: !0
                        })) : void (t.composingLock || "‘" === n.data || "“" === n.data || "《" === n.data || R(e, getSelection().getRangeAt(0).cloneRange(), !1, n))
                    })), this.element.addEventListener("click", (function (n) {
                        if ("INPUT" === n.target.tagName) return n.target.checked ? n.target.setAttribute("checked", "checked") : n.target.removeAttribute("checked"), t.preventInput = !0, void Mt(e);
                        var r = (0, D.zh)(e), o = (0, y.fb)(n.target, "vditor-ir__preview");
                        if (o || (o = (0, y.fb)(r.startContainer, "vditor-ir__preview")), o && (o.previousElementSibling.firstElementChild ? r.selectNodeContents(o.previousElementSibling.firstElementChild) : r.selectNodeContents(o.previousElementSibling), r.collapse(!0), (0, D.Hc)(r), Ae(e)), "IMG" === n.target.tagName) {
                            var a = n.target.parentElement.querySelector(".vditor-ir__marker--link");
                            a && (r.selectNode(a), (0, D.Hc)(r))
                        }
                        var l = (0, y.a1)(n.target, "data-type", "a");
                        if (!l || l.classList.contains("vditor-ir__node--expand")) {
                            if (n.target.isEqualNode(t.element) && t.element.lastElementChild && r.collapsed) {
                                var s = t.element.lastElementChild.getBoundingClientRect();
                                n.y > s.top + s.height && ("P" === t.element.lastElementChild.tagName && "" === t.element.lastElementChild.textContent.trim().replace(i.g.ZWSP, "") ? (r.selectNodeContents(t.element.lastElementChild), r.collapse(!1)) : (t.element.insertAdjacentHTML("beforeend", '<p data-block="0">' + i.g.ZWSP + "<wbr></p>"), (0, D.ib)(t.element, r)))
                            }
                            "" === r.toString() ? q(r, e) : setTimeout((function () {
                                q((0, D.zh)(e), e)
                            })), I(n, e), X(e)
                        } else e.options.link.click ? e.options.link.click(l.querySelector(":scope > .vditor-ir__marker--link")) : e.options.link.isOpen && window.open(l.querySelector(":scope > .vditor-ir__marker--link").textContent)
                    })), this.element.addEventListener("keyup", (function (n) {
                        if (!n.isComposing && !(0, d.yl)(n)) if ("Enter" === n.key && Ae(e), X(e), "Backspace" !== n.key && "Delete" !== n.key || "" === e.ir.element.innerHTML || 1 !== e.ir.element.childNodes.length || !e.ir.element.firstElementChild || "P" !== e.ir.element.firstElementChild.tagName || 0 !== e.ir.element.firstElementChild.childElementCount || "" !== e.ir.element.textContent && "\n" !== e.ir.element.textContent) {
                            var r = (0, D.zh)(e);
                            "Backspace" === n.key ? ((0, d.vU)() && "\n" === r.startContainer.textContent && 1 === r.startOffset && (r.startContainer.textContent = "", q(r, e)), t.element.querySelectorAll(".language-math").forEach((function (e) {
                                var t = e.querySelector("br");
                                t && t.remove()
                            }))) : n.key.indexOf("Arrow") > -1 ? ("ArrowLeft" !== n.key && "ArrowRight" !== n.key || Tt(e), q(r, e)) : 229 === n.keyCode && "" === n.code && "Unidentified" === n.key && q(r, e);
                            var o = (0, y.fb)(r.startContainer, "vditor-ir__preview");
                            if (o) {
                                if ("ArrowUp" === n.key || "ArrowLeft" === n.key) return o.previousElementSibling.firstElementChild ? r.selectNodeContents(o.previousElementSibling.firstElementChild) : r.selectNodeContents(o.previousElementSibling), r.collapse(!1), n.preventDefault(), !0;
                                if ("SPAN" === o.tagName && ("ArrowDown" === n.key || "ArrowRight" === n.key)) return "html-entity" === o.parentElement.getAttribute("data-type") ? (o.parentElement.insertAdjacentText("afterend", i.g.ZWSP), r.setStart(o.parentElement.nextSibling, 1)) : r.selectNodeContents(o.parentElement.lastElementChild), r.collapse(!1), n.preventDefault(), !0
                            }
                        } else e.ir.element.innerHTML = ""
                    }))
                }, e
            }(), It = function (e) {
                return "sv" === e.currentMode ? e.lute.Md2HTML(a(e)) : "wysiwyg" === e.currentMode ? e.lute.VditorDOM2HTML(e.wysiwyg.element.innerHTML) : "ir" === e.currentMode ? e.lute.VditorIRDOM2HTML(e.ir.element.innerHTML) : void 0
            }, jt = n(895), Rt = n(818), Pt = function () {
                function e(e) {
                    this.element = document.createElement("div"), this.element.className = "vditor-outline", this.element.innerHTML = '<div class="vditor-outline__title">' + e + '</div>\n<div class="vditor-outline__content"></div>'
                }

                return e.prototype.render = function (e) {
                    return "block" === e.preview.element.style.display ? (0, Rt.k)(e.preview.element.lastElementChild, this.element.lastElementChild, e) : (0, Rt.k)(e[e.currentMode].element, this.element.lastElementChild, e)
                }, e.prototype.toggle = function (e, t, n) {
                    var r;
                    void 0 === t && (t = !0), void 0 === n && (n = !0);
                    var o = null === (r = e.toolbar.elements.outline) || void 0 === r ? void 0 : r.firstElementChild;
                    if (t && window.innerWidth >= i.g.MOBILE_WIDTH ? (this.element.style.display = "block", this.render(e), null == o || o.classList.add("vditor-menu--current")) : (this.element.style.display = "none", null == o || o.classList.remove("vditor-menu--current")), n && getSelection().rangeCount > 0) {
                        var a = getSelection().getRangeAt(0);
                        e[e.currentMode].element.contains(a.startContainer) && (0, D.Hc)(a)
                    }
                    z(e)
                }, e
            }(), qt = n(554), Bt = function () {
                function e(e) {
                    var t = this;
                    this.element = document.createElement("div"), this.element.className = "vditor-preview";
                    var n = document.createElement("div");
                    n.className = "vditor-reset", e.options.classes.preview && n.classList.add(e.options.classes.preview), n.style.maxWidth = e.options.preview.maxWidth + "px", n.addEventListener("copy", (function (n) {
                        if ("TEXTAREA" !== n.target.tagName) {
                            var r = document.createElement("div");
                            r.className = "vditor-reset", r.appendChild(getSelection().getRangeAt(0).cloneContents()), t.copyToX(e, r), n.preventDefault()
                        }
                    })), n.addEventListener("click", (function (r) {
                        var i = (0, y.lG)(r.target, "SPAN");
                        if (i && (0, y.fb)(i, "vditor-toc")) {
                            var o = n.querySelector("#" + i.getAttribute("data-target-id"));
                            o && (t.element.scrollTop = o.offsetTop)
                        } else {
                            if ("A" === r.target.tagName) return e.options.link.click ? e.options.link.click(r.target) : e.options.link.isOpen && window.open(r.target.getAttribute("href")), void r.preventDefault();
                            "IMG" === r.target.tagName && (e.options.image.preview ? e.options.image.preview(r.target) : e.options.image.isPreview && (0, B.E)(r.target, e.options.lang, e.options.theme))
                        }
                    }));
                    var r = e.options.preview.actions, i = document.createElement("div");
                    i.className = "vditor-preview__action";
                    for (var o = [], a = 0; a < r.length; a++) {
                        var l = r[a];
                        if ("object" != typeof l) switch (l) {
                            case"desktop":
                                o.push('<button type="button" class="vditor-preview__action--current" data-type="desktop">Desktop</button>');
                                break;
                            case"tablet":
                                o.push('<button type="button" data-type="tablet">Tablet</button>');
                                break;
                            case"mobile":
                                o.push('<button type="button" data-type="mobile">Mobile/Wechat</button>');
                                break;
                            case"mp-wechat":
                                o.push('<button type="button" data-type="mp-wechat" class="vditor-tooltipped vditor-tooltipped__w" aria-label="复制到公众号"><svg><use xlink:href="#vditor-icon-mp-wechat"></use></svg></button>');
                                break;
                            case"zhihu":
                                o.push('<button type="button" data-type="zhihu" class="vditor-tooltipped vditor-tooltipped__w" aria-label="复制到知乎"><svg><use xlink:href="#vditor-icon-zhihu"></use></svg></button>')
                        } else o.push('<button type="button" data-type="' + l.key + '" class="' + l.className + '"' + (l.tooltip ? ' aria-label="' + l.tooltip + '"' : "") + '">' + l.text + "</button>")
                    }
                    i.innerHTML = o.join(""), 0 === r.length && (i.style.display = "none"), this.element.appendChild(i), this.element.appendChild(n), i.addEventListener((0, d.Le)(), (function (o) {
                        var a = (0, b.S)(o.target, "BUTTON");
                        if (a) {
                            var l = a.getAttribute("data-type"), s = r.find((function (e) {
                                return (null == e ? void 0 : e.key) === l
                            }));
                            s ? s.click(l) : "mp-wechat" !== l && "zhihu" !== l ? (n.style.width = "desktop" === l ? "auto" : "tablet" === l ? "780px" : "360px", n.scrollWidth > n.parentElement.clientWidth && (n.style.width = "auto"), t.render(e), i.querySelectorAll("button").forEach((function (e) {
                                e.classList.remove("vditor-preview__action--current")
                            })), a.classList.add("vditor-preview__action--current")) : t.copyToX(e, t.element.lastElementChild.cloneNode(!0), l)
                        }
                    }))
                }

                return e.prototype.render = function (e, t) {
                    var n = this;
                    if (clearTimeout(this.mdTimeoutId), "none" !== this.element.style.display) if (t) this.element.lastElementChild.innerHTML = t; else if ("" !== a(e).replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, "")) {
                        var r = (new Date).getTime(), i = a(e);
                        this.mdTimeoutId = window.setTimeout((function () {
                            if (e.options.preview.url) {
                                var t = new XMLHttpRequest;
                                t.open("POST", e.options.preview.url), t.setRequestHeader("Content-Type", "application/json;charset=UTF-8"), t.onreadystatechange = function () {
                                    if (t.readyState === XMLHttpRequest.DONE) if (200 === t.status) {
                                        var o = JSON.parse(t.responseText);
                                        if (0 !== o.code) return void e.tip.show(o.msg);
                                        e.options.preview.transform && (o.data = e.options.preview.transform(o.data)), n.element.lastElementChild.innerHTML = o.data, n.afterRender(e, r)
                                    } else {
                                        var a = e.lute.Md2HTML(i);
                                        e.options.preview.transform && (a = e.options.preview.transform(a)), n.element.lastElementChild.innerHTML = a, n.afterRender(e, r)
                                    }
                                }, t.send(JSON.stringify({markdownText: i}))
                            } else {
                                var o = e.lute.Md2HTML(i);
                                e.options.preview.transform && (o = e.options.preview.transform(o)), n.element.lastElementChild.innerHTML = o, n.afterRender(e, r)
                            }
                        }), e.options.preview.delay)
                    } else this.element.lastElementChild.innerHTML = ""; else "renderPerformance" === this.element.getAttribute("data-type") && e.tip.hide()
                }, e.prototype.afterRender = function (e, t) {
                    e.options.preview.parse && e.options.preview.parse(this.element);
                    var n = (new Date).getTime() - t;
                    (new Date).getTime() - t > 2600 ? (e.tip.show(window.VditorI18n.performanceTip.replace("${x}", n.toString())), e.preview.element.setAttribute("data-type", "renderPerformance")) : "renderPerformance" === e.preview.element.getAttribute("data-type") && (e.tip.hide(), e.preview.element.removeAttribute("data-type"));
                    var r = e.preview.element.querySelector(".vditor-comment--focus");
                    r && r.classList.remove("vditor-comment--focus"), (0, S.O)(e.preview.element.lastElementChild), (0, T.s)(e.options.preview.hljs, e.preview.element.lastElementChild, e.options.cdn), (0, A.i)(e.preview.element.lastElementChild, e.options.cdn, e.options.theme), (0, _.K)(e.preview.element.lastElementChild, e.options.cdn, e.options.theme), (0, L.P)(e.preview.element.lastElementChild, e.options.cdn), (0, C.v)(e.preview.element.lastElementChild, e.options.cdn), (0, k.p)(e.preview.element.lastElementChild, e.options.cdn, e.options.theme), (0, x.P)(e.preview.element.lastElementChild, e.options.cdn, e.options.theme), (0, H.B)(e.preview.element.lastElementChild, e.options.cdn), (0, E.Q)(e.preview.element.lastElementChild, e.options.cdn), (0, qt.Y)(e.preview.element.lastElementChild);
                    var i = e.preview.element, o = e.outline.render(e);
                    "" === o && (o = "[ToC]"), i.querySelectorAll('[data-type="toc-block"]').forEach((function (t) {
                        t.innerHTML = o, (0, M.H)(t, {cdn: e.options.cdn, math: e.options.preview.math})
                    })), (0, M.H)(e.preview.element.lastElementChild, {
                        cdn: e.options.cdn,
                        math: e.options.preview.math
                    })
                }, e.prototype.copyToX = function (e, t, n) {
                    void 0 === n && (n = "mp-wechat"), "zhihu" !== n ? t.querySelectorAll(".katex-html .base").forEach((function (e) {
                        e.style.display = "initial"
                    })) : t.querySelectorAll(".language-math").forEach((function (e) {
                        e.outerHTML = '<images class="Formula-image" data-eeimg="true" src="//www.zhihu.com/equation?tex=" alt="' + e.getAttribute("data-math") + '\\" style="display: block; margin: 0 auto; max-width: 100%;">'
                    })), t.style.backgroundColor = "#fff", t.querySelectorAll("code").forEach((function (e) {
                        e.style.backgroundImage = "none"
                    })), this.element.append(t);
                    var r = t.ownerDocument.createRange();
                    r.selectNode(t), (0, D.Hc)(r), document.execCommand("copy"), this.element.lastElementChild.remove(), e.tip.show("已复制，可到" + ("zhihu" === n ? "知乎" : "微信公众号平台") + "进行粘贴")
                }, e
            }(), Vt = function () {
                function e(e) {
                    this.element = document.createElement("div"), this.element.className = "vditor-resize vditor-resize--" + e.options.resize.position, this.element.innerHTML = '<div><svg><use xlink:href="#vditor-icon-resize"></use></svg></div>', this.bindEvent(e)
                }

                return e.prototype.bindEvent = function (e) {
                    var t = this;
                    this.element.addEventListener("mousedown", (function (n) {
                        var r = document, i = n.clientY, o = e.element.offsetHeight,
                            a = 63 + e.element.querySelector(".vditor-toolbar").clientHeight;
                        r.ondragstart = function () {
                            return !1
                        }, window.captureEvents && window.captureEvents(), t.element.classList.add("vditor-resize--selected"), r.onmousemove = function (t) {
                            "top" === e.options.resize.position ? e.element.style.height = Math.max(a, o + (i - t.clientY)) + "px" : e.element.style.height = Math.max(a, o + (t.clientY - i)) + "px", e.options.typewriterMode && (e.sv.element.style.paddingBottom = e.sv.element.parentElement.offsetHeight / 2 + "px")
                        }, r.onmouseup = function () {
                            e.options.resize.after && e.options.resize.after(e.element.offsetHeight - o), window.captureEvents && window.captureEvents(), r.onmousemove = null, r.onmouseup = null, r.ondragstart = null, r.onselectstart = null, r.onselect = null, t.element.classList.remove("vditor-resize--selected")
                        }
                    }))
                }, e
            }(), Ut = function () {
                function e(e) {
                    this.composingLock = !1, this.element = document.createElement("pre"), this.element.className = "vditor-sv vditor-reset", this.element.setAttribute("placeholder", e.options.placeholder), this.element.setAttribute("contenteditable", "true"), this.element.setAttribute("spellcheck", "false"), this.bindEvent(e), ke(e, this.element), Le(e, this.element), _e(e, this.element), xe(e, this.element), Ce(e, this.element), Te(e, this.element, this.copy), Me(e, this.element, this.copy)
                }

                return e.prototype.copy = function (e, t) {
                    e.stopPropagation(), e.preventDefault(), e.clipboardData.setData("text/plain", Ee(t[t.currentMode].element))
                }, e.prototype.bindEvent = function (e) {
                    var t = this;
                    this.element.addEventListener("paste", (function (t) {
                        Ct(e, t, {
                            pasteCode: function (e) {
                                document.execCommand("insertHTML", !1, e)
                            }
                        })
                    })), this.element.addEventListener("scroll", (function () {
                        if ("block" === e.preview.element.style.display) {
                            var n = t.element.scrollTop, r = t.element.clientHeight,
                                i = t.element.scrollHeight - parseFloat(t.element.style.paddingBottom || "0"),
                                o = e.preview.element;
                            o.scrollTop = n / r > .5 ? (n + r) * o.scrollHeight / i - r : n * o.scrollHeight / i
                        }
                    })), this.element.addEventListener("compositionstart", (function (e) {
                        t.composingLock = !0
                    })), this.element.addEventListener("compositionend", (function (n) {
                        (0, d.vU)() || V(e, n), t.composingLock = !1
                    })), this.element.addEventListener("input", (function (n) {
                        if ("deleteByDrag" !== n.inputType && "insertFromDrop" !== n.inputType && !t.composingLock && "‘" !== n.data && "“" !== n.data && "《" !== n.data) return t.preventInput ? (t.preventInput = !1, void Ie(e, {
                            enableAddUndoStack: !0,
                            enableHint: !0,
                            enableInput: !0
                        })) : void V(e, n)
                    })), this.element.addEventListener("keyup", (function (t) {
                        t.isComposing || (0, d.yl)(t) || ("Backspace" !== t.key && "Delete" !== t.key || "" === e.sv.element.innerHTML || 1 !== e.sv.element.childNodes.length || !e.sv.element.firstElementChild || "DIV" !== e.sv.element.firstElementChild.tagName || 2 !== e.sv.element.firstElementChild.childElementCount || "" !== e.sv.element.firstElementChild.textContent && "\n" !== e.sv.element.textContent ? "Enter" === t.key && Ae(e) : e.sv.element.innerHTML = "")
                    }))
                }, e
            }(), Wt = function () {
                function e() {
                    this.element = document.createElement("div"), this.element.className = "vditor-tip"
                }

                return e.prototype.show = function (e, t) {
                    var n = this;
                    void 0 === t && (t = 6e3), this.element.className = "vditor-tip vditor-tip--show", 0 === t ? (this.element.innerHTML = '<div class="vditor-tip__content">' + e + '\n<div class="vditor-tip__close">X</div></div>', this.element.querySelector(".vditor-tip__close").addEventListener("click", (function () {
                        n.hide()
                    }))) : (this.element.innerHTML = '<div class="vditor-tip__content">' + e + "</div>", setTimeout((function () {
                        n.hide()
                    }), t)), this.element.removeAttribute("style"), setTimeout((function () {
                        n.element.getBoundingClientRect().top < 46 && (n.element.style.position = "fixed", n.element.style.top = "46px")
                    }), 150)
                }, e.prototype.hide = function () {
                    this.element.className = "vditor-messageElementtip", this.element.innerHTML = ""
                }, e
            }(), zt = function (e, t) {
                if (t.options.preview.mode !== e) {
                    switch (t.options.preview.mode = e, e) {
                        case"both":
                            t.sv.element.style.display = "block", t.preview.element.style.display = "block", t.preview.render(t), u(t.toolbar.elements, ["both"]);
                            break;
                        case"editor":
                            t.sv.element.style.display = "block", t.preview.element.style.display = "none", c(t.toolbar.elements, ["both"])
                    }
                    t.devtools && t.devtools.renderEchart(t)
                }
            }, Gt = function () {
                var e = function (t, n) {
                    return e = Object.setPrototypeOf || {__proto__: []} instanceof Array && function (e, t) {
                        e.__proto__ = t
                    } || function (e, t) {
                        for (var n in t) t.hasOwnProperty(n) && (e[n] = t[n])
                    }, e(t, n)
                };
                return function (t, n) {
                    function r() {
                        this.constructor = t
                    }

                    e(t, n), t.prototype = null === n ? Object.create(n) : (r.prototype = n.prototype, new r)
                }
            }(), Kt = function (e) {
                function t(t, n) {
                    var r = e.call(this, t, n) || this;
                    return "both" === t.options.preview.mode && r.element.children[0].classList.add("vditor-menu--current"), r.element.children[0].addEventListener((0, d.Le)(), (function (e) {
                        r.element.firstElementChild.classList.contains(i.g.CLASS_MENU_DISABLED) || (e.preventDefault(), "sv" === t.currentMode && ("both" === t.options.preview.mode ? zt("editor", t) : zt("both", t)))
                    })), r
                }

                return Gt(t, e), t
            }(ge), Ft = function () {
                this.element = document.createElement("div"), this.element.className = "vditor-toolbar__br"
            }, Zt = n(312), Jt = function () {
                var e = function (t, n) {
                    return e = Object.setPrototypeOf || {__proto__: []} instanceof Array && function (e, t) {
                        e.__proto__ = t
                    } || function (e, t) {
                        for (var n in t) t.hasOwnProperty(n) && (e[n] = t[n])
                    }, e(t, n)
                };
                return function (t, n) {
                    function r() {
                        this.constructor = t
                    }

                    e(t, n), t.prototype = null === n ? Object.create(n) : (r.prototype = n.prototype, new r)
                }
            }(), Xt = function (e) {
                function t(t, n) {
                    var r = e.call(this, t, n) || this, o = r.element.children[0], a = document.createElement("div");
                    a.className = "vditor-hint" + (2 === n.level ? "" : " vditor-panel--arrow");
                    var l = "";
                    return i.g.CODE_THEME.forEach((function (e) {
                        l += "<button>" + e + "</button>"
                    })), a.innerHTML = '<div style="overflow: auto;max-height:' + window.innerHeight / 2 + 'px">' + l + "</div>", a.addEventListener((0, d.Le)(), (function (e) {
                        "BUTTON" === e.target.tagName && (v(t, ["subToolbar"]), t.options.preview.hljs.style = e.target.textContent, (0, Zt.Y)(e.target.textContent, t.options.cdn), e.preventDefault(), e.stopPropagation())
                    })), r.element.appendChild(a), g(t, a, o, n.level), r
                }

                return Jt(t, e), t
            }(ge), Yt = function () {
                var e = function (t, n) {
                    return e = Object.setPrototypeOf || {__proto__: []} instanceof Array && function (e, t) {
                        e.__proto__ = t
                    } || function (e, t) {
                        for (var n in t) t.hasOwnProperty(n) && (e[n] = t[n])
                    }, e(t, n)
                };
                return function (t, n) {
                    function r() {
                        this.constructor = t
                    }

                    e(t, n), t.prototype = null === n ? Object.create(n) : (r.prototype = n.prototype, new r)
                }
            }(), Qt = function (e) {
                function t(t, n) {
                    var r = e.call(this, t, n) || this, i = r.element.children[0], o = document.createElement("div");
                    o.className = "vditor-hint" + (2 === n.level ? "" : " vditor-panel--arrow");
                    var a = "";
                    return Object.keys(t.options.preview.theme.list).forEach((function (e) {
                        a += '<button data-type="' + e + '">' + t.options.preview.theme.list[e] + "</button>"
                    })), o.innerHTML = '<div style="overflow: auto;max-height:' + window.innerHeight / 2 + 'px">' + a + "</div>", o.addEventListener((0, d.Le)(), (function (e) {
                        "BUTTON" === e.target.tagName && (v(t, ["subToolbar"]), t.options.preview.theme.current = e.target.getAttribute("data-type"), (0, U.Z)(t.options.preview.theme.current, t.options.preview.theme.path), e.preventDefault(), e.stopPropagation())
                    })), r.element.appendChild(o), g(t, o, i, n.level), r
                }

                return Yt(t, e), t
            }(ge), $t = function () {
                function e(e) {
                    this.element = document.createElement("span"), this.element.className = "vditor-counter vditor-tooltipped vditor-tooltipped__nw", this.render(e, "")
                }

                return e.prototype.render = function (e, t) {
                    var n = t.endsWith("\n") ? t.length - 1 : t.length;
                    if ("text" === e.options.counter.type && e[e.currentMode]) {
                        var r = e[e.currentMode].element.cloneNode(!0);
                        r.querySelectorAll(".vditor-wysiwyg__preview").forEach((function (e) {
                            e.remove()
                        })), n = r.textContent.length
                    }
                    "number" == typeof e.options.counter.max ? (n > e.options.counter.max ? this.element.className = "vditor-counter vditor-counter--error" : this.element.className = "vditor-counter", this.element.innerHTML = n + "/" + e.options.counter.max) : this.element.innerHTML = "" + n, this.element.setAttribute("aria-label", e.options.counter.type), e.options.counter.after && e.options.counter.after(n, {
                        enable: e.options.counter.enable,
                        max: e.options.counter.max,
                        type: e.options.counter.type
                    })
                }, e
            }(), en = function () {
                var e = function (t, n) {
                    return e = Object.setPrototypeOf || {__proto__: []} instanceof Array && function (e, t) {
                        e.__proto__ = t
                    } || function (e, t) {
                        for (var n in t) t.hasOwnProperty(n) && (e[n] = t[n])
                    }, e(t, n)
                };
                return function (t, n) {
                    function r() {
                        this.constructor = t
                    }

                    e(t, n), t.prototype = null === n ? Object.create(n) : (r.prototype = n.prototype, new r)
                }
            }(), tn = function (e) {
                function t(t, n) {
                    var r = e.call(this, t, n) || this;
                    return r.element.children[0].innerHTML = n.icon, r.element.children[0].addEventListener((0, d.Le)(), (function (e) {
                        e.preventDefault(), e.currentTarget.classList.contains(i.g.CLASS_MENU_DISABLED) || n.click(e, t)
                    })), r
                }

                return en(t, e), t
            }(ge), nn = function () {
                var e = function (t, n) {
                    return e = Object.setPrototypeOf || {__proto__: []} instanceof Array && function (e, t) {
                        e.__proto__ = t
                    } || function (e, t) {
                        for (var n in t) t.hasOwnProperty(n) && (e[n] = t[n])
                    }, e(t, n)
                };
                return function (t, n) {
                    function r() {
                        this.constructor = t
                    }

                    e(t, n), t.prototype = null === n ? Object.create(n) : (r.prototype = n.prototype, new r)
                }
            }(), rn = function (e) {
                function t(t, n) {
                    var r = e.call(this, t, n) || this;
                    return r.element.firstElementChild.addEventListener((0, d.Le)(), (function (e) {
                        var n = r.element.firstElementChild;
                        n.classList.contains(i.g.CLASS_MENU_DISABLED) || (e.preventDefault(), n.classList.contains("vditor-menu--current") ? (n.classList.remove("vditor-menu--current"), t.devtools.element.style.display = "none", z(t)) : (n.classList.add("vditor-menu--current"), t.devtools.element.style.display = "block", z(t), t.devtools.renderEchart(t)))
                    })), r
                }

                return nn(t, e), t
            }(ge), on = function () {
                this.element = document.createElement("div"), this.element.className = "vditor-toolbar__divider"
            }, an = function () {
                var e = function (t, n) {
                    return e = Object.setPrototypeOf || {__proto__: []} instanceof Array && function (e, t) {
                        e.__proto__ = t
                    } || function (e, t) {
                        for (var n in t) t.hasOwnProperty(n) && (e[n] = t[n])
                    }, e(t, n)
                };
                return function (t, n) {
                    function r() {
                        this.constructor = t
                    }

                    e(t, n), t.prototype = null === n ? Object.create(n) : (r.prototype = n.prototype, new r)
                }
            }(), ln = function (e) {
                function t(t, n) {
                    var r = e.call(this, t, n) || this, i = document.createElement("div");
                    i.className = "vditor-panel vditor-panel--arrow";
                    var o = "";
                    return Object.keys(t.options.hint.emoji).forEach((function (e) {
                        var n = t.options.hint.emoji[e];
                        n.indexOf(".") > -1 ? o += '<button data-value=":' + e + ': " data-key=":' + e + ':"><images\ndata-value=":' + e + ': " data-key=":' + e + ':" class="vditor-emojis__icon" src="' + n + '"/></button>' : o += '<button data-value="' + n + ' "\n data-key="' + e + '"><span class="vditor-emojis__icon">' + n + "</span></button>"
                    })), i.innerHTML = '<div class="vditor-emojis" style="max-height: ' + ("auto" === t.options.height ? "auto" : t.options.height - 80) + 'px">' + o + '</div><div class="vditor-emojis__tail">\n    <span class="vditor-emojis__tip"></span><span>' + (t.options.hint.emojiTail || "") + "</span>\n</div>", r.element.appendChild(i), g(t, i, r.element.firstElementChild, n.level), r.bindEvent(t), r
                }

                return an(t, e), t.prototype.bindEvent = function (e) {
                    var t = this;
                    this.element.lastElementChild.addEventListener((0, d.Le)(), (function (n) {
                        var r = (0, b.S)(n.target, "BUTTON");
                        if (r) {
                            n.preventDefault();
                            var i = r.getAttribute("data-value"), o = (0, D.zh)(e), a = i;
                            if ("wysiwyg" === e.currentMode ? a = e.lute.SpinVditorDOM(i) : "ir" === e.currentMode && (a = e.lute.SpinVditorIRDOM(i)), i.indexOf(":") > -1 && "sv" !== e.currentMode) {
                                var l = document.createElement("div");
                                l.innerHTML = a, a = l.firstElementChild.firstElementChild.outerHTML + " ", (0, D.oC)(a, e)
                            } else o.extractContents(), o.insertNode(document.createTextNode(i));
                            o.collapse(!1), (0, D.Hc)(o), t.element.lastElementChild.style.display = "none", dt(e)
                        }
                    })), this.element.lastElementChild.addEventListener("mouseover", (function (e) {
                        var n = (0, b.S)(e.target, "BUTTON");
                        n && (t.element.querySelector(".vditor-emojis__tip").innerHTML = n.getAttribute("data-key"))
                    }))
                }, t
            }(ge), sn = function (e, t, n) {
                var r = document.createElement("a");
                "download" in r ? (r.download = n, r.style.display = "none", r.href = URL.createObjectURL(new Blob([t])), document.body.appendChild(r), r.click(), r.remove()) : e.tip.show(window.VditorI18n.downloadTip, 0)
            }, dn = function () {
                var e = function (t, n) {
                    return e = Object.setPrototypeOf || {__proto__: []} instanceof Array && function (e, t) {
                        e.__proto__ = t
                    } || function (e, t) {
                        for (var n in t) t.hasOwnProperty(n) && (e[n] = t[n])
                    }, e(t, n)
                };
                return function (t, n) {
                    function r() {
                        this.constructor = t
                    }

                    e(t, n), t.prototype = null === n ? Object.create(n) : (r.prototype = n.prototype, new r)
                }
            }(), cn = function (e) {
                function t(t, n) {
                    var r = e.call(this, t, n) || this, i = r.element.children[0], o = document.createElement("div");
                    return o.className = "vditor-hint" + (2 === n.level ? "" : " vditor-panel--arrow"), o.innerHTML = '<button data-type="markdown">Markdown</button>\n<button data-type="pdf">PDF</button>\n<button data-type="html">HTML</button>', o.addEventListener((0, d.Le)(), (function (e) {
                        var n = e.target;
                        if ("BUTTON" === n.tagName) {
                            switch (n.getAttribute("data-type")) {
                                case"markdown":
                                    !function (e) {
                                        var t = a(e);
                                        sn(e, t, t.substr(0, 10) + ".md")
                                    }(t);
                                    break;
                                case"pdf":
                                    !function (e) {
                                        e.tip.show(window.VditorI18n.generate, 3800);
                                        var t = document.querySelector("#vditorExportIframe");
                                        t.contentDocument.open(), t.contentDocument.write('<link rel="stylesheet" href="' + e.options.cdn + '/dist/index.css"/>\n<script src="' + e.options.cdn + '/dist/method.min.js"><\/script>\n<div id="preview" style="width: 800px"></div>\n<script>\nwindow.addEventListener("message", (e) => {\n  if(!e.data) {\n    return;\n  }\n  Vditor.preview(document.getElementById(\'preview\'), e.data, {\n    markdown: {\n      theme: "' + e.options.preview.theme + '"\n    },\n    hljs: {\n      style: "' + e.options.preview.hljs.style + '"\n    }\n  });\n  setTimeout(() => {\n        window.print();\n    }, 3600);\n}, false);\n<\/script>'), t.contentDocument.close(), setTimeout((function () {
                                            t.contentWindow.postMessage(a(e), "*")
                                        }), 200)
                                    }(t);
                                    break;
                                case"html":
                                    !function (e) {
                                        var t = It(e),
                                            n = '<html><head><link rel="stylesheet" type="text/css" href="' + e.options.cdn + '/dist/index.css"/>\n<script src="' + e.options.cdn + "/dist/js/i18n/" + e.options.lang + '.js"><\/script>\n<script src="' + e.options.cdn + '/dist/method.min.js"><\/script></head>\n<body><div class="vditor-reset" id="preview">' + t + "</div>\n<script>\n    const previewElement = document.getElementById('preview')\n    Vditor.setContentTheme('" + e.options.preview.theme.current + "', '" + e.options.preview.theme.path + "');\n    Vditor.codeRender(previewElement);\n    Vditor.highlightRender(" + JSON.stringify(e.options.preview.hljs) + ", previewElement, '" + e.options.cdn + "');\n    Vditor.mathRender(previewElement, {\n        cdn: '" + e.options.cdn + "',\n        math: " + JSON.stringify(e.options.preview.math) + ",\n    });\n    Vditor.mermaidRender(previewElement, '" + e.options.cdn + "', '" + e.options.theme + "');\n    Vditor.markmapRender(previewElement, '" + e.options.cdn + "', '" + e.options.theme + "');\n    Vditor.flowchartRender(previewElement, '" + e.options.cdn + "');\n    Vditor.graphvizRender(previewElement, '" + e.options.cdn + "');\n    Vditor.chartRender(previewElement, '" + e.options.cdn + "', '" + e.options.theme + "');\n    Vditor.mindmapRender(previewElement, '" + e.options.cdn + "', '" + e.options.theme + "');\n    Vditor.abcRender(previewElement, '" + e.options.cdn + "');\n    Vditor.mediaRender(previewElement);\n    Vditor.speechRender(previewElement);\n<\/script>\n<script src=\"" + e.options.cdn + "/dist/js/icons/" + e.options.icon + '.js"><\/script></body></html>';
                                        sn(e, n, t.substr(0, 10) + ".html")
                                    }(t)
                            }
                            v(t, ["subToolbar"]), e.preventDefault(), e.stopPropagation()
                        }
                    })), r.element.appendChild(o), g(t, o, i, n.level), r
                }

                return dn(t, e), t
            }(ge), un = function () {
                var e = function (t, n) {
                    return e = Object.setPrototypeOf || {__proto__: []} instanceof Array && function (e, t) {
                        e.__proto__ = t
                    } || function (e, t) {
                        for (var n in t) t.hasOwnProperty(n) && (e[n] = t[n])
                    }, e(t, n)
                };
                return function (t, n) {
                    function r() {
                        this.constructor = t
                    }

                    e(t, n), t.prototype = null === n ? Object.create(n) : (r.prototype = n.prototype, new r)
                }
            }(), pn = function (e) {
                function t(t, n) {
                    var r = e.call(this, t, n) || this;
                    return r._bindEvent(t, n), r
                }

                return un(t, e), t.prototype._bindEvent = function (e, t) {
                    this.element.children[0].addEventListener((0, d.Le)(), (function (n) {
                        n.preventDefault(), e.element.className.includes("vditor--fullscreen") ? (t.level || (this.innerHTML = t.icon), e.element.style.zIndex = "", document.body.style.overflow = "", e.element.classList.remove("vditor--fullscreen"), Object.keys(e.toolbar.elements).forEach((function (t) {
                            var n = e.toolbar.elements[t].firstChild;
                            n && (n.className = n.className.replace("__s", "__n"))
                        })), e.counter && (e.counter.element.className = e.counter.element.className.replace("__s", "__n"))) : (t.level || (this.innerHTML = '<svg><use xlink:href="#vditor-icon-contract"></use></svg>'), e.element.style.zIndex = e.options.fullscreen.index.toString(), document.body.style.overflow = "hidden", e.element.classList.add("vditor--fullscreen"), Object.keys(e.toolbar.elements).forEach((function (t) {
                            var n = e.toolbar.elements[t].firstChild;
                            n && (n.className = n.className.replace("__n", "__s"))
                        })), e.counter && (e.counter.element.className = e.counter.element.className.replace("__n", "__s"))), e.devtools && e.devtools.renderEchart(e), t.click && t.click(n, e), z(e), G(e)
                    }))
                }, t
            }(ge), mn = function () {
                var e = function (t, n) {
                    return e = Object.setPrototypeOf || {__proto__: []} instanceof Array && function (e, t) {
                        e.__proto__ = t
                    } || function (e, t) {
                        for (var n in t) t.hasOwnProperty(n) && (e[n] = t[n])
                    }, e(t, n)
                };
                return function (t, n) {
                    function r() {
                        this.constructor = t
                    }

                    e(t, n), t.prototype = null === n ? Object.create(n) : (r.prototype = n.prototype, new r)
                }
            }(), fn = function (e) {
                function t(t, n) {
                    var r = e.call(this, t, n) || this, i = document.createElement("div");
                    return i.className = "vditor-hint vditor-panel--arrow", i.innerHTML = '<button data-tag="h1" data-value="# ">' + window.VditorI18n.heading1 + " " + (0, d.ns)("&lt;⌥⌘1>") + '</button>\n<button data-tag="h2" data-value="## ">' + window.VditorI18n.heading2 + " &lt;" + (0, d.ns)("⌥⌘2") + '></button>\n<button data-tag="h3" data-value="### ">' + window.VditorI18n.heading3 + " &lt;" + (0, d.ns)("⌥⌘3") + '></button>\n<button data-tag="h4" data-value="#### ">' + window.VditorI18n.heading4 + " &lt;" + (0, d.ns)("⌥⌘4") + '></button>\n<button data-tag="h5" data-value="##### ">' + window.VditorI18n.heading5 + " &lt;" + (0, d.ns)("⌥⌘5") + '></button>\n<button data-tag="h6" data-value="###### ">' + window.VditorI18n.heading6 + " &lt;" + (0, d.ns)("⌥⌘6") + "></button>", r.element.appendChild(i), r._bindEvent(t, i), r
                }

                return mn(t, e), t.prototype._bindEvent = function (e, t) {
                    var n = this.element.children[0];
                    n.addEventListener((0, d.Le)(), (function (r) {
                        r.preventDefault(), clearTimeout(e.wysiwyg.afterRenderTimeoutId), clearTimeout(e.ir.processTimeoutId), clearTimeout(e.sv.processTimeoutId), n.classList.contains(i.g.CLASS_MENU_DISABLED) || (n.blur(), n.classList.contains("vditor-menu--current") ? ("wysiwyg" === e.currentMode ? (ne(e), Y(e)) : "ir" === e.currentMode && At(e, ""), n.classList.remove("vditor-menu--current")) : (v(e, ["subToolbar"]), t.style.display = "block"))
                    }));
                    for (var r = 0; r < 6; r++) t.children.item(r).addEventListener((0, d.Le)(), (function (r) {
                        r.preventDefault(), "wysiwyg" === e.currentMode ? (te(e, r.target.getAttribute("data-tag")), Y(e), n.classList.add("vditor-menu--current")) : "ir" === e.currentMode ? (At(e, r.target.getAttribute("data-value")), n.classList.add("vditor-menu--current")) : je(e, r.target.getAttribute("data-value")), t.style.display = "none"
                    }))
                }, t
            }(ge), hn = function () {
                var e = function (t, n) {
                    return e = Object.setPrototypeOf || {__proto__: []} instanceof Array && function (e, t) {
                        e.__proto__ = t
                    } || function (e, t) {
                        for (var n in t) t.hasOwnProperty(n) && (e[n] = t[n])
                    }, e(t, n)
                };
                return function (t, n) {
                    function r() {
                        this.constructor = t
                    }

                    e(t, n), t.prototype = null === n ? Object.create(n) : (r.prototype = n.prototype, new r)
                }
            }(), vn = function (e) {
                function t(t, n) {
                    var r = e.call(this, t, n) || this;
                    return r.element.children[0].addEventListener((0, d.Le)(), (function (e) {
                        e.preventDefault(), t.tip.show('<div style="margin-bottom:14px;font-size: 14px;line-height: 22px;min-width:300px;max-width: 360px;display: flex;">\n<div style="margin-top: 14px;flex: 1">\n    <div>Markdown 使用指南</div>\n    <ul style="list-style: none">\n        <li><a href="https://ld246.com/article/1583308420519" target="_blank">语法速查手册</a></li>\n        <li><a href="https://ld246.com/article/1583129520165" target="_blank">基础语法</a></li>\n        <li><a href="https://ld246.com/article/1583305480675" target="_blank">扩展语法</a></li>\n        <li><a href="https://ld246.com/article/1582778815353" target="_blank">键盘快捷键</a></li>\n    </ul>\n</div>\n<div style="margin-top: 14px;flex: 1">\n    <div>Vditor 支持</div>\n    <ul style="list-style: none">\n        <li><a href="https://github.com/Vanessa219/vditor/issues" target="_blank">Issues</a></li>\n        <li><a href="https://ld246.com/tag/vditor" target="_blank">官方讨论区</a></li>\n        <li><a href="https://ld246.com/article/1549638745630" target="_blank">开发手册</a></li>\n        <li><a href="https://ld246.com/guide/markdown" target="_blank">演示地址</a></li>\n    </ul>\n</div></div>', 0)
                    })), r
                }

                return hn(t, e), t
            }(ge), gn = function () {
                var e = function (t, n) {
                    return e = Object.setPrototypeOf || {__proto__: []} instanceof Array && function (e, t) {
                        e.__proto__ = t
                    } || function (e, t) {
                        for (var n in t) t.hasOwnProperty(n) && (e[n] = t[n])
                    }, e(t, n)
                };
                return function (t, n) {
                    function r() {
                        this.constructor = t
                    }

                    e(t, n), t.prototype = null === n ? Object.create(n) : (r.prototype = n.prototype, new r)
                }
            }(), yn = function (e) {
                function t(t, n) {
                    var r = e.call(this, t, n) || this;
                    return r.element.children[0].addEventListener((0, d.Le)(), (function (e) {
                        if (e.preventDefault(), !r.element.firstElementChild.classList.contains(i.g.CLASS_MENU_DISABLED) && "sv" !== t.currentMode) {
                            var n = (0, D.zh)(t), o = (0, y.lG)(n.startContainer, "LI");
                            o && it(t, o, n)
                        }
                    })), r
                }

                return gn(t, e), t
            }(ge), bn = function () {
                var e = function (t, n) {
                    return e = Object.setPrototypeOf || {__proto__: []} instanceof Array && function (e, t) {
                        e.__proto__ = t
                    } || function (e, t) {
                        for (var n in t) t.hasOwnProperty(n) && (e[n] = t[n])
                    }, e(t, n)
                };
                return function (t, n) {
                    function r() {
                        this.constructor = t
                    }

                    e(t, n), t.prototype = null === n ? Object.create(n) : (r.prototype = n.prototype, new r)
                }
            }(), wn = function (e) {
                function t(t, n) {
                    var r = e.call(this, t, n) || this;
                    return r.element.children[0].addEventListener((0, d.Le)(), (function (e) {
                        e.preventDefault(), t.tip.show('<div style="max-width: 520px; font-size: 14px;line-height: 22px;margin-bottom: 14px;">\n<p style="text-align: center;margin: 14px 0">\n    <em>下一代的 Markdown 编辑器，为未来而构建</em>\n</p>\n<div style="display: flex;margin-bottom: 14px;flex-wrap: wrap;align-items: center">\n    <images src="https://unpkg.com/vditor/dist/images/logo.png" style="margin: 0 auto;height: 68px"/>\n    <div>&nbsp;&nbsp;</div>\n    <div style="flex: 1;min-width: 250px">\n        Vditor 是一款浏览器端的 Markdown 编辑器，支持所见即所得、即时渲染（类似 Typora）和分屏预览模式。\n        它使用 TypeScript 实现，支持原生 JavaScript 以及 Vue、React、Angular 和 Svelte 等框架。\n    </div>\n</div>\n<div style="display: flex;flex-wrap: wrap;">\n    <ul style="list-style: none;flex: 1;min-width:148px">\n        <li>\n        项目地址：<a href="https://b3log.org/vditor" target="_blank">b3log.org/vditor</a>\n        </li>\n        <li>\n        开源协议：MIT\n        </li>\n    </ul>\n    <ul style="list-style: none;margin-right: 18px">\n        <li>\n        组件版本：Vditor v' + i.H + " / Lute v" + Lute.Version + '\n        </li>\n        <li>\n        赞助捐赠：<a href="https://ld246.com/sponsor" target="_blank">https://ld246.com/sponsor</a>\n        </li>\n    </ul>\n</div>\n</div>', 0)
                    })), r
                }

                return bn(t, e), t
            }(ge), En = function () {
                var e = function (t, n) {
                    return e = Object.setPrototypeOf || {__proto__: []} instanceof Array && function (e, t) {
                        e.__proto__ = t
                    } || function (e, t) {
                        for (var n in t) t.hasOwnProperty(n) && (e[n] = t[n])
                    }, e(t, n)
                };
                return function (t, n) {
                    function r() {
                        this.constructor = t
                    }

                    e(t, n), t.prototype = null === n ? Object.create(n) : (r.prototype = n.prototype, new r)
                }
            }(), kn = function (e) {
                function t(t, n) {
                    var r = e.call(this, t, n) || this;
                    return r.element.children[0].addEventListener((0, d.Le)(), (function (e) {
                        e.preventDefault(), r.element.firstElementChild.classList.contains(i.g.CLASS_MENU_DISABLED) || "sv" === t.currentMode || Ye(t, "afterend")
                    })), r
                }

                return En(t, e), t
            }(ge), Sn = function () {
                var e = function (t, n) {
                    return e = Object.setPrototypeOf || {__proto__: []} instanceof Array && function (e, t) {
                        e.__proto__ = t
                    } || function (e, t) {
                        for (var n in t) t.hasOwnProperty(n) && (e[n] = t[n])
                    }, e(t, n)
                };
                return function (t, n) {
                    function r() {
                        this.constructor = t
                    }

                    e(t, n), t.prototype = null === n ? Object.create(n) : (r.prototype = n.prototype, new r)
                }
            }(), Ln = function (e) {
                function t(t, n) {
                    var r = e.call(this, t, n) || this;
                    return r.element.children[0].addEventListener((0, d.Le)(), (function (e) {
                        e.preventDefault(), r.element.firstElementChild.classList.contains(i.g.CLASS_MENU_DISABLED) || "sv" === t.currentMode || Ye(t, "beforebegin")
                    })), r
                }

                return Sn(t, e), t
            }(ge), Cn = function () {
                var e = function (t, n) {
                    return e = Object.setPrototypeOf || {__proto__: []} instanceof Array && function (e, t) {
                        e.__proto__ = t
                    } || function (e, t) {
                        for (var n in t) t.hasOwnProperty(n) && (e[n] = t[n])
                    }, e(t, n)
                };
                return function (t, n) {
                    function r() {
                        this.constructor = t
                    }

                    e(t, n), t.prototype = null === n ? Object.create(n) : (r.prototype = n.prototype, new r)
                }
            }(), Tn = function (e) {
                function t(t, n) {
                    var r = e.call(this, t, n) || this;
                    return r.element.children[0].addEventListener((0, d.Le)(), (function (e) {
                        if (e.preventDefault(), !r.element.firstElementChild.classList.contains(i.g.CLASS_MENU_DISABLED) && "sv" !== t.currentMode) {
                            var n = (0, D.zh)(t), o = (0, y.lG)(n.startContainer, "LI");
                            o && ot(t, o, n, o.parentElement)
                        }
                    })), r
                }

                return Cn(t, e), t
            }(ge), Mn = function () {
                var e = function (t, n) {
                    return e = Object.setPrototypeOf || {__proto__: []} instanceof Array && function (e, t) {
                        e.__proto__ = t
                    } || function (e, t) {
                        for (var n in t) t.hasOwnProperty(n) && (e[n] = t[n])
                    }, e(t, n)
                };
                return function (t, n) {
                    function r() {
                        this.constructor = t
                    }

                    e(t, n), t.prototype = null === n ? Object.create(n) : (r.prototype = n.prototype, new r)
                }
            }(), An = function (e) {
                function t(t, n) {
                    var r = e.call(this, t, n) || this;
                    return t.options.outline && r.element.firstElementChild.classList.add("vditor-menu--current"), r.element.children[0].addEventListener((0, d.Le)(), (function (e) {
                        e.preventDefault(), t.toolbar.elements.outline.firstElementChild.classList.contains(i.g.CLASS_MENU_DISABLED) || (t.options.outline.enable = !r.element.firstElementChild.classList.contains("vditor-menu--current"), t.outline.toggle(t, t.options.outline.enable))
                    })), r
                }

                return Mn(t, e), t
            }(ge), _n = function () {
                var e = function (t, n) {
                    return e = Object.setPrototypeOf || {__proto__: []} instanceof Array && function (e, t) {
                        e.__proto__ = t
                    } || function (e, t) {
                        for (var n in t) t.hasOwnProperty(n) && (e[n] = t[n])
                    }, e(t, n)
                };
                return function (t, n) {
                    function r() {
                        this.constructor = t
                    }

                    e(t, n), t.prototype = null === n ? Object.create(n) : (r.prototype = n.prototype, new r)
                }
            }(), xn = function (e) {
                function t(t, n) {
                    var r = e.call(this, t, n) || this;
                    return r._bindEvent(t), r
                }

                return _n(t, e), t.prototype._bindEvent = function (e) {
                    var t = this;
                    this.element.children[0].addEventListener((0, d.Le)(), (function (n) {
                        n.preventDefault();
                        var r = t.element.firstElementChild;
                        if (!r.classList.contains(i.g.CLASS_MENU_DISABLED)) {
                            var o = i.g.EDIT_TOOLBARS.concat(["both", "edit-mode", "devtools"]);
                            r.classList.contains("vditor-menu--current") ? (r.classList.remove("vditor-menu--current"), "sv" === e.currentMode ? (e.sv.element.style.display = "block", "both" === e.options.preview.mode ? e.preview.element.style.display = "block" : e.preview.element.style.display = "none") : (e[e.currentMode].element.parentElement.style.display = "block", e.preview.element.style.display = "none"), p(e.toolbar.elements, o), e.outline.render(e)) : (m(e.toolbar.elements, o), e.preview.element.style.display = "block", "sv" === e.currentMode ? e.sv.element.style.display = "none" : e[e.currentMode].element.parentElement.style.display = "none", e.preview.render(e), r.classList.add("vditor-menu--current"), v(e, ["subToolbar", "hint", "popover"]), setTimeout((function () {
                                e.outline.render(e)
                            }), e.options.preview.delay + 10)), z(e)
                        }
                    }))
                }, t
            }(ge), Hn = function () {
                function e(e) {
                    var t;
                    if (this.SAMPLE_RATE = 5e3, this.isRecording = !1, this.readyFlag = !1, this.leftChannel = [], this.rightChannel = [], this.recordingLength = 0, "undefined" != typeof AudioContext) t = new AudioContext; else {
                        if (!webkitAudioContext) return;
                        t = new webkitAudioContext
                    }
                    this.DEFAULT_SAMPLE_RATE = t.sampleRate;
                    var n = t.createGain();
                    t.createMediaStreamSource(e).connect(n), this.recorder = t.createScriptProcessor(2048, 2, 1), this.recorder.onaudioprocess = null, n.connect(this.recorder), this.recorder.connect(t.destination), this.readyFlag = !0
                }

                return e.prototype.cloneChannelData = function (e, t) {
                    this.leftChannel.push(new Float32Array(e)), this.rightChannel.push(new Float32Array(t)), this.recordingLength += 2048
                }, e.prototype.startRecordingNewWavFile = function () {
                    this.readyFlag && (this.isRecording = !0, this.leftChannel.length = this.rightChannel.length = 0, this.recordingLength = 0)
                }, e.prototype.stopRecording = function () {
                    this.isRecording = !1
                }, e.prototype.buildWavFileBlob = function () {
                    for (var e = this.mergeBuffers(this.leftChannel), t = this.mergeBuffers(this.rightChannel), n = new Float32Array(e.length), r = 0; r < e.length; ++r) n[r] = .5 * (e[r] + t[r]);
                    this.DEFAULT_SAMPLE_RATE > this.SAMPLE_RATE && (n = this.downSampleBuffer(n, this.SAMPLE_RATE));
                    var i = 44 + 2 * n.length, o = new ArrayBuffer(i), a = new DataView(o);
                    this.writeUTFBytes(a, 0, "RIFF"), a.setUint32(4, i, !0), this.writeUTFBytes(a, 8, "WAVE"), this.writeUTFBytes(a, 12, "fmt "), a.setUint32(16, 16, !0), a.setUint16(20, 1, !0), a.setUint16(22, 1, !0), a.setUint32(24, this.SAMPLE_RATE, !0), a.setUint32(28, 2 * this.SAMPLE_RATE, !0), a.setUint16(32, 2, !0), a.setUint16(34, 16, !0);
                    var l = 2 * n.length;
                    this.writeUTFBytes(a, 36, "data"), a.setUint32(40, l, !0);
                    for (var s = n.length, d = 44, c = 0; c < s; c++) a.setInt16(d, 32767 * n[c], !0), d += 2;
                    return new Blob([a], {type: "audio/wav"})
                }, e.prototype.downSampleBuffer = function (e, t) {
                    if (t === this.DEFAULT_SAMPLE_RATE) return e;
                    if (t > this.DEFAULT_SAMPLE_RATE) return e;
                    for (var n = this.DEFAULT_SAMPLE_RATE / t, r = Math.round(e.length / n), i = new Float32Array(r), o = 0, a = 0; o < i.length;) {
                        for (var l = Math.round((o + 1) * n), s = 0, d = 0, c = a; c < l && c < e.length; c++) s += e[c], d++;
                        i[o] = s / d, o++, a = l
                    }
                    return i
                }, e.prototype.mergeBuffers = function (e) {
                    for (var t = new Float32Array(this.recordingLength), n = 0, r = e.length, i = 0; i < r; ++i) {
                        var o = e[i];
                        t.set(o, n), n += o.length
                    }
                    return t
                }, e.prototype.writeUTFBytes = function (e, t, n) {
                    for (var r = n.length, i = 0; i < r; i++) e.setUint8(t + i, n.charCodeAt(i))
                }, e
            }(), Nn = function () {
                var e = function (t, n) {
                    return e = Object.setPrototypeOf || {__proto__: []} instanceof Array && function (e, t) {
                        e.__proto__ = t
                    } || function (e, t) {
                        for (var n in t) t.hasOwnProperty(n) && (e[n] = t[n])
                    }, e(t, n)
                };
                return function (t, n) {
                    function r() {
                        this.constructor = t
                    }

                    e(t, n), t.prototype = null === n ? Object.create(n) : (r.prototype = n.prototype, new r)
                }
            }(), Dn = function (e) {
                function t(t, n) {
                    var r = e.call(this, t, n) || this;
                    return r._bindEvent(t), r
                }

                return Nn(t, e), t.prototype._bindEvent = function (e) {
                    var t, n = this;
                    this.element.children[0].addEventListener((0, d.Le)(), (function (r) {
                        if (r.preventDefault(), !n.element.firstElementChild.classList.contains(i.g.CLASS_MENU_DISABLED)) {
                            var o = e[e.currentMode].element;
                            if (t) if (t.isRecording) {
                                t.stopRecording(), e.tip.hide();
                                var a = new File([t.buildWavFileBlob()], "record" + (new Date).getTime() + ".wav", {type: "video/webm"});
                                We(e, [a]), n.element.children[0].classList.remove("vditor-menu--current")
                            } else e.tip.show(window.VditorI18n.recording), o.setAttribute("contenteditable", "false"), t.startRecordingNewWavFile(), n.element.children[0].classList.add("vditor-menu--current"); else navigator.mediaDevices.getUserMedia({audio: !0}).then((function (r) {
                                (t = new Hn(r)).recorder.onaudioprocess = function (e) {
                                    if (t.isRecording) {
                                        var n = e.inputBuffer.getChannelData(0), r = e.inputBuffer.getChannelData(1);
                                        t.cloneChannelData(n, r)
                                    }
                                }, t.startRecordingNewWavFile(), e.tip.show(window.VditorI18n.recording), o.setAttribute("contenteditable", "false"), n.element.children[0].classList.add("vditor-menu--current")
                            })).catch((function () {
                                e.tip.show(window.VditorI18n["record-tip"])
                            }))
                        }
                    }))
                }, t
            }(ge), On = function () {
                var e = function (t, n) {
                    return e = Object.setPrototypeOf || {__proto__: []} instanceof Array && function (e, t) {
                        e.__proto__ = t
                    } || function (e, t) {
                        for (var n in t) t.hasOwnProperty(n) && (e[n] = t[n])
                    }, e(t, n)
                };
                return function (t, n) {
                    function r() {
                        this.constructor = t
                    }

                    e(t, n), t.prototype = null === n ? Object.create(n) : (r.prototype = n.prototype, new r)
                }
            }(), In = function (e) {
                function t(t, n) {
                    var r = e.call(this, t, n) || this;
                    return m({redo: r.element}, ["redo"]), r.element.children[0].addEventListener((0, d.Le)(), (function (e) {
                        e.preventDefault(), r.element.firstElementChild.classList.contains(i.g.CLASS_MENU_DISABLED) || t.undo.redo(t)
                    })), r
                }

                return On(t, e), t
            }(ge), jn = function () {
                var e = function (t, n) {
                    return e = Object.setPrototypeOf || {__proto__: []} instanceof Array && function (e, t) {
                        e.__proto__ = t
                    } || function (e, t) {
                        for (var n in t) t.hasOwnProperty(n) && (e[n] = t[n])
                    }, e(t, n)
                };
                return function (t, n) {
                    function r() {
                        this.constructor = t
                    }

                    e(t, n), t.prototype = null === n ? Object.create(n) : (r.prototype = n.prototype, new r)
                }
            }(), Rn = function (e) {
                function t(t, n) {
                    var r = e.call(this, t, n) || this;
                    return m({undo: r.element}, ["undo"]), r.element.children[0].addEventListener((0, d.Le)(), (function (e) {
                        e.preventDefault(), r.element.firstElementChild.classList.contains(i.g.CLASS_MENU_DISABLED) || t.undo.undo(t)
                    })), r
                }

                return jn(t, e), t
            }(ge), Pn = function () {
                var e = function (t, n) {
                    return e = Object.setPrototypeOf || {__proto__: []} instanceof Array && function (e, t) {
                        e.__proto__ = t
                    } || function (e, t) {
                        for (var n in t) t.hasOwnProperty(n) && (e[n] = t[n])
                    }, e(t, n)
                };
                return function (t, n) {
                    function r() {
                        this.constructor = t
                    }

                    e(t, n), t.prototype = null === n ? Object.create(n) : (r.prototype = n.prototype, new r)
                }
            }(), qn = function (e) {
                function t(t, n) {
                    var r = e.call(this, t, n) || this, i = '<input type="file"';
                    return t.options.upload.multiple && (i += ' multiple="multiple"'), t.options.upload.accept && (i += ' accept="' + t.options.upload.accept + '"'), r.element.children[0].innerHTML = "" + (n.icon || '<svg><use xlink:href="#vditor-icon-upload"></use></svg>') + i + ">", r._bindEvent(t), r
                }

                return Pn(t, e), t.prototype._bindEvent = function (e) {
                    var t = this;
                    this.element.children[0].addEventListener((0, d.Le)(), (function (e) {
                        if (t.element.firstElementChild.classList.contains(i.g.CLASS_MENU_DISABLED)) return e.stopPropagation(), void e.preventDefault()
                    })), this.element.querySelector("input").addEventListener("change", (function (n) {
                        if (t.element.firstElementChild.classList.contains(i.g.CLASS_MENU_DISABLED)) return n.stopPropagation(), void n.preventDefault();
                        0 !== n.target.files.length && We(e, n.target.files, n.target)
                    }))
                }, t
            }(ge), Bn = function () {
                function e(e) {
                    var t = this, n = e.options;
                    this.elements = {}, this.element = document.createElement("div"), this.element.className = "vditor-toolbar", n.toolbar.forEach((function (n, r) {
                        var i = t.genItem(e, n, r);
                        if (t.element.appendChild(i), n.toolbar) {
                            var o = document.createElement("div");
                            o.className = "vditor-hint vditor-panel--arrow", o.addEventListener((0, d.Le)(), (function (e) {
                                o.style.display = "none"
                            })), n.toolbar.forEach((function (n, i) {
                                n.level = 2, o.appendChild(t.genItem(e, n, r + i))
                            })), i.appendChild(o), g(e, o, i.children[0])
                        }
                    })), e.options.toolbarConfig.hide && this.element.classList.add("vditor-toolbar--hide"), e.options.toolbarConfig.pin && this.element.classList.add("vditor-toolbar--pin"), e.options.counter.enable && (e.counter = new $t(e), this.element.appendChild(e.counter.element))
                }

                return e.prototype.genItem = function (e, t, n) {
                    var r;
                    switch (t.name) {
                        case"bold":
                        case"italic":
                        case"more":
                        case"strike":
                        case"line":
                        case"quote":
                        case"list":
                        case"ordered-list":
                        case"check":
                        case"code":
                        case"inline-code":
                        case"link":
                        case"table":
                            r = new ge(e, t);
                            break;
                        case"emoji":
                            r = new ln(e, t);
                            break;
                        case"headings":
                            r = new fn(e, t);
                            break;
                        case"|":
                            r = new on;
                            break;
                        case"br":
                            r = new Ft;
                            break;
                        case"undo":
                            r = new Rn(e, t);
                            break;
                        case"redo":
                            r = new In(e, t);
                            break;
                        case"help":
                            r = new vn(e, t);
                            break;
                        case"both":
                            r = new Kt(e, t);
                            break;
                        case"preview":
                            r = new xn(e, t);
                            break;
                        case"fullscreen":
                            r = new pn(e, t);
                            break;
                        case"upload":
                            r = new qn(e, t);
                            break;
                        case"record":
                            r = new Dn(e, t);
                            break;
                        case"info":
                            r = new wn(e, t);
                            break;
                        case"edit-mode":
                            r = new we(e, t);
                            break;
                        case"devtools":
                            r = new rn(e, t);
                            break;
                        case"outdent":
                            r = new Tn(e, t);
                            break;
                        case"indent":
                            r = new yn(e, t);
                            break;
                        case"outline":
                            r = new An(e, t);
                            break;
                        case"insert-after":
                            r = new kn(e, t);
                            break;
                        case"insert-before":
                            r = new Ln(e, t);
                            break;
                        case"code-theme":
                            r = new Xt(e, t);
                            break;
                        case"content-theme":
                            r = new Qt(e, t);
                            break;
                        case"export":
                            r = new cn(e, t);
                            break;
                        default:
                            r = new tn(e, t)
                    }
                    if (r) {
                        var i = t.name;
                        return "br" !== i && "|" !== i || (i += n), this.elements[i] = r.element, r.element
                    }
                }, e
            }(), Vn = n(14), Un = function () {
                function e() {
                    this.stackSize = 50, this.resetStack(), this.dmp = new Vn
                }

                return e.prototype.clearStack = function (e) {
                    this.resetStack(), this.resetIcon(e)
                }, e.prototype.resetIcon = function (e) {
                    e.toolbar && (this[e.currentMode].undoStack.length > 1 ? p(e.toolbar.elements, ["undo"]) : m(e.toolbar.elements, ["undo"]), 0 !== this[e.currentMode].redoStack.length ? p(e.toolbar.elements, ["redo"]) : m(e.toolbar.elements, ["redo"]))
                }, e.prototype.undo = function (e) {
                    if ("false" !== e[e.currentMode].element.getAttribute("contenteditable") && !(this[e.currentMode].undoStack.length < 2)) {
                        var t = this[e.currentMode].undoStack.pop();
                        t && (this[e.currentMode].redoStack.push(t), this.renderDiff(t, e), this[e.currentMode].hasUndo = !0, v(e, ["hint"]))
                    }
                }, e.prototype.redo = function (e) {
                    if ("false" !== e[e.currentMode].element.getAttribute("contenteditable")) {
                        var t = this[e.currentMode].redoStack.pop();
                        t && (this[e.currentMode].undoStack.push(t), this.renderDiff(t, e, !0))
                    }
                }, e.prototype.recordFirstPosition = function (e, t) {
                    if (0 !== getSelection().rangeCount && !(1 !== this[e.currentMode].undoStack.length || 0 === this[e.currentMode].undoStack[0].length || this[e.currentMode].redoStack.length > 0 || (0, d.vU)() && "Backspace" === t.key || (0, d.G6)())) {
                        var n = this.addCaret(e);
                        n.replace("<wbr>", "").replace(" vditor-ir__node--expand", "") === this[e.currentMode].undoStack[0][0].diffs[0][1].replace("<wbr>", "") && (this[e.currentMode].undoStack[0][0].diffs[0][1] = n, this[e.currentMode].lastText = n)
                    }
                }, e.prototype.addToUndoStack = function (e) {
                    var t = this.addCaret(e, !0), n = this.dmp.diff_main(t, this[e.currentMode].lastText, !0),
                        r = this.dmp.patch_make(t, this[e.currentMode].lastText, n);
                    0 === r.length && this[e.currentMode].undoStack.length > 0 || (this[e.currentMode].lastText = t, this[e.currentMode].undoStack.push(r), this[e.currentMode].undoStack.length > this.stackSize && this[e.currentMode].undoStack.shift(), this[e.currentMode].hasUndo && (this[e.currentMode].redoStack = [], this[e.currentMode].hasUndo = !1, m(e.toolbar.elements, ["redo"])), this[e.currentMode].undoStack.length > 1 && p(e.toolbar.elements, ["undo"]))
                }, e.prototype.renderDiff = function (e, t, n) {
                    var r;
                    if (void 0 === n && (n = !1), n) {
                        var i = this.dmp.patch_deepCopy(e).reverse();
                        i.forEach((function (e) {
                            e.diffs.forEach((function (e) {
                                e[0] = -e[0]
                            }))
                        })), r = this.dmp.patch_apply(i, this[t.currentMode].lastText)[0]
                    } else r = this.dmp.patch_apply(e, this[t.currentMode].lastText)[0];
                    if (this[t.currentMode].lastText = r, t[t.currentMode].element.innerHTML = r, "sv" !== t.currentMode && t[t.currentMode].element.querySelectorAll(".vditor-" + t.currentMode + "__preview[data-render='2']").forEach((function (e) {
                        N(e, t)
                    })), t[t.currentMode].element.querySelector("wbr")) (0, D.ib)(t[t.currentMode].element, t[t.currentMode].element.ownerDocument.createRange()), Ae(t); else {
                        var o = getSelection().getRangeAt(0);
                        o.setEndBefore(t[t.currentMode].element), o.collapse(!1)
                    }
                    O(t), dt(t, {
                        enableAddUndoStack: !1,
                        enableHint: !1,
                        enableInput: !0
                    }), fe(t), t[t.currentMode].element.querySelectorAll(".vditor-" + t.currentMode + "__preview[data-render='2']").forEach((function (e) {
                        N(e, t)
                    })), this[t.currentMode].undoStack.length > 1 ? p(t.toolbar.elements, ["undo"]) : m(t.toolbar.elements, ["undo"]), 0 !== this[t.currentMode].redoStack.length ? p(t.toolbar.elements, ["redo"]) : m(t.toolbar.elements, ["redo"])
                }, e.prototype.resetStack = function () {
                    this.ir = {hasUndo: !1, lastText: "", redoStack: [], undoStack: []}, this.sv = {
                        hasUndo: !1,
                        lastText: "",
                        redoStack: [],
                        undoStack: []
                    }, this.wysiwyg = {hasUndo: !1, lastText: "", redoStack: [], undoStack: []}
                }, e.prototype.addCaret = function (e, t) {
                    var n;
                    if (void 0 === t && (t = !1), 0 !== getSelection().rangeCount && !e[e.currentMode].element.querySelector("wbr")) {
                        var r = getSelection().getRangeAt(0);
                        if (e[e.currentMode].element.contains(r.startContainer)) {
                            n = r.cloneRange();
                            var i = document.createElement("span");
                            i.className = "vditor-wbr", r.insertNode(i)
                        }
                    }
                    e.ir.element.cloneNode(!0).querySelectorAll(".vditor-" + e.currentMode + "__preview[data-render='1']").forEach((function (e) {
                        (e.firstElementChild.classList.contains("language-echarts") || e.firstElementChild.classList.contains("language-plantuml") || e.firstElementChild.classList.contains("language-mindmap")) && (e.firstElementChild.removeAttribute("_echarts_instance_"), e.firstElementChild.removeAttribute("data-processed"), e.firstElementChild.innerHTML = e.previousElementSibling.firstElementChild.innerHTML, e.setAttribute("data-render", "2")), e.firstElementChild.classList.contains("language-math") && (e.setAttribute("data-render", "2"), e.firstElementChild.textContent = e.firstElementChild.getAttribute("data-math"), e.firstElementChild.removeAttribute("data-math"))
                    }));
                    var o = e[e.currentMode].element.innerHTML;
                    return e[e.currentMode].element.querySelectorAll(".vditor-wbr").forEach((function (e) {
                        e.remove()
                    })), t && n && (0, D.Hc)(n), o.replace('<span class="vditor-wbr"></span>', "<wbr>")
                }, e
            }(), Wn = n(640), zn = function () {
                function e(e) {
                    this.defaultOptions = {
                        rtl: !1,
                        after: void 0,
                        cache: {enable: !0},
                        cdn: i.g.CDN,
                        classes: {preview: ""},
                        comment: {enable: !1},
                        counter: {enable: !1, type: "markdown"},
                        debugger: !1,
                        fullscreen: {index: 90},
                        height: "auto",
                        hint: {
                            delay: 200,
                            emoji: {
                                "+1": "👍",
                                "-1": "👎",
                                confused: "😕",
                                eyes: "👀️",
                                heart: "❤️",
                                rocket: "🚀️",
                                smile: "😄",
                                tada: "🎉️"
                            },
                            emojiPath: i.g.CDN + "/dist/images/emoji",
                            extend: [],
                            parse: !0
                        },
                        icon: "ant",
                        lang: "zh_CN",
                        mode: "ir",
                        outline: {enable: !1, position: "left"},
                        placeholder: "",
                        preview: {
                            actions: ["desktop", "tablet", "mobile", "mp-wechat", "zhihu"],
                            delay: 1e3,
                            hljs: i.g.HLJS_OPTIONS,
                            markdown: i.g.MARKDOWN_OPTIONS,
                            math: i.g.MATH_OPTIONS,
                            maxWidth: 800,
                            mode: "both",
                            theme: i.g.THEME_OPTIONS
                        },
                        link: {isOpen: !0},
                        image: {isPreview: !0},
                        resize: {enable: !1, position: "bottom"},
                        theme: "classic",
                        toolbar: ["emoji", "headings", "bold", "italic", "strike", "link", "|", "list", "ordered-list", "check", "outdent", "indent", "|", "quote", "line", "code", "inline-code", "insert-before", "insert-after", "|", "upload", "record", "table", "|", "undo", "redo", "|", "fullscreen", "edit-mode", {
                            name: "more",
                            toolbar: ["both", "code-theme", "content-theme", "export", "outline", "preview", "devtools", "info", "help"]
                        }],
                        toolbarConfig: {hide: !1, pin: !1},
                        typewriterMode: !1,
                        undoDelay: 800,
                        upload: {
                            extraData: {}, fieldName: "file[]", filename: function (e) {
                                return e.replace(/\W/g, "")
                            }, linkToImgUrl: "", max: 10485760, multiple: !0, url: "", withCredentials: !1
                        },
                        value: "",
                        width: "auto"
                    }, this.options = e
                }

                return e.prototype.merge = function () {
                    var e, t, n;
                    this.options && (this.options.toolbar ? this.options.toolbar = this.mergeToolbar(this.options.toolbar) : this.options.toolbar = this.mergeToolbar(this.defaultOptions.toolbar), (null === (t = null === (e = this.options.preview) || void 0 === e ? void 0 : e.theme) || void 0 === t ? void 0 : t.list) && (this.defaultOptions.preview.theme.list = this.options.preview.theme.list), (null === (n = this.options.hint) || void 0 === n ? void 0 : n.emoji) && (this.defaultOptions.hint.emoji = this.options.hint.emoji), this.options.comment && (this.defaultOptions.comment = this.options.comment));
                    var r = (0, Wn.T)(this.defaultOptions, this.options);
                    if (r.cache.enable && !r.cache.id) throw new Error("need options.cache.id, see https://ld246.com/article/1549638745630#options");
                    return r
                }, e.prototype.mergeToolbar = function (e) {
                    var t = this, n = [{
                        icon: '<svg><use xlink:href="#vditor-icon-export"></use></svg>',
                        name: "export",
                        tipPosition: "ne"
                    }, {
                        hotkey: "⌘E",
                        icon: '<svg><use xlink:href="#vditor-icon-emoji"></use></svg>',
                        name: "emoji",
                        tipPosition: "ne"
                    }, {
                        hotkey: "⌘H",
                        icon: '<svg><use xlink:href="#vditor-icon-headings"></use></svg>',
                        name: "headings",
                        tipPosition: "ne"
                    }, {
                        hotkey: "⌘B",
                        icon: '<svg><use xlink:href="#vditor-icon-bold"></use></svg>',
                        name: "bold",
                        prefix: "**",
                        suffix: "**",
                        tipPosition: "ne"
                    }, {
                        hotkey: "⌘I",
                        icon: '<svg><use xlink:href="#vditor-icon-italic"></use></svg>',
                        name: "italic",
                        prefix: "*",
                        suffix: "*",
                        tipPosition: "ne"
                    }, {
                        hotkey: "⌘D",
                        icon: '<svg><use xlink:href="#vditor-icon-strike"></use></svg>',
                        name: "strike",
                        prefix: "~~",
                        suffix: "~~",
                        tipPosition: "ne"
                    }, {
                        hotkey: "⌘K",
                        icon: '<svg><use xlink:href="#vditor-icon-link"></use></svg>',
                        name: "link",
                        prefix: "[",
                        suffix: "](https://)",
                        tipPosition: "n"
                    }, {name: "|"}, {
                        hotkey: "⌘L",
                        icon: '<svg><use xlink:href="#vditor-icon-list"></use></svg>',
                        name: "list",
                        prefix: "* ",
                        tipPosition: "n"
                    }, {
                        hotkey: "⌘O",
                        icon: '<svg><use xlink:href="#vditor-icon-ordered-list"></use></svg>',
                        name: "ordered-list",
                        prefix: "1. ",
                        tipPosition: "n"
                    }, {
                        hotkey: "⌘J",
                        icon: '<svg><use xlink:href="#vditor-icon-check"></use></svg>',
                        name: "check",
                        prefix: "* [ ] ",
                        tipPosition: "n"
                    }, {
                        hotkey: "⇧⌘I",
                        icon: '<svg><use xlink:href="#vditor-icon-outdent"></use></svg>',
                        name: "outdent",
                        tipPosition: "n"
                    }, {
                        hotkey: "⇧⌘O",
                        icon: '<svg><use xlink:href="#vditor-icon-indent"></use></svg>',
                        name: "indent",
                        tipPosition: "n"
                    }, {name: "|"}, {
                        hotkey: "⌘;",
                        icon: '<svg><use xlink:href="#vditor-icon-quote"></use></svg>',
                        name: "quote",
                        prefix: "> ",
                        tipPosition: "n"
                    }, {
                        hotkey: "⇧⌘H",
                        icon: '<svg><use xlink:href="#vditor-icon-line"></use></svg>',
                        name: "line",
                        prefix: "---",
                        tipPosition: "n"
                    }, {
                        hotkey: "⌘U",
                        icon: '<svg><use xlink:href="#vditor-icon-code"></use></svg>',
                        name: "code",
                        prefix: "```",
                        suffix: "\n```",
                        tipPosition: "n"
                    }, {
                        hotkey: "⌘G",
                        icon: '<svg><use xlink:href="#vditor-icon-inline-code"></use></svg>',
                        name: "inline-code",
                        prefix: "`",
                        suffix: "`",
                        tipPosition: "n"
                    }, {
                        hotkey: "⇧⌘B",
                        icon: '<svg><use xlink:href="#vditor-icon-before"></use></svg>',
                        name: "insert-before",
                        tipPosition: "n"
                    }, {
                        hotkey: "⇧⌘E",
                        icon: '<svg><use xlink:href="#vditor-icon-after"></use></svg>',
                        name: "insert-after",
                        tipPosition: "n"
                    }, {name: "|"}, {
                        icon: '<svg><use xlink:href="#vditor-icon-upload"></use></svg>',
                        name: "upload",
                        tipPosition: "n"
                    }, {
                        icon: '<svg><use xlink:href="#vditor-icon-record"></use></svg>',
                        name: "record",
                        tipPosition: "n"
                    }, {
                        hotkey: "⌘M",
                        icon: '<svg><use xlink:href="#vditor-icon-table"></use></svg>',
                        name: "table",
                        prefix: "| col1",
                        suffix: " | col2 | col3 |\n| --- | --- | --- |\n|  |  |  |\n|  |  |  |",
                        tipPosition: "n"
                    }, {name: "|"}, {
                        hotkey: "⌘Z",
                        icon: '<svg><use xlink:href="#vditor-icon-undo"></use></svg>',
                        name: "undo",
                        tipPosition: "nw"
                    }, {
                        hotkey: "⌘Y",
                        icon: '<svg><use xlink:href="#vditor-icon-redo"></use></svg>',
                        name: "redo",
                        tipPosition: "nw"
                    }, {name: "|"}, {
                        icon: '<svg><use xlink:href="#vditor-icon-more"></use></svg>',
                        name: "more",
                        tipPosition: "e"
                    }, {
                        hotkey: "⌘'",
                        icon: '<svg><use xlink:href="#vditor-icon-fullscreen"></use></svg>',
                        name: "fullscreen",
                        tipPosition: "nw"
                    }, {
                        icon: '<svg><use xlink:href="#vditor-icon-edit"></use></svg>',
                        name: "edit-mode",
                        tipPosition: "nw"
                    }, {
                        hotkey: "⌘P",
                        icon: '<svg><use xlink:href="#vditor-icon-both"></use></svg>',
                        name: "both",
                        tipPosition: "nw"
                    }, {
                        icon: '<svg><use xlink:href="#vditor-icon-preview"></use></svg>',
                        name: "preview",
                        tipPosition: "nw"
                    }, {
                        icon: '<svg><use xlink:href="#vditor-icon-align-center"></use></svg>',
                        name: "outline",
                        tipPosition: "nw"
                    }, {
                        icon: '<svg><use xlink:href="#vditor-icon-theme"></use></svg>',
                        name: "content-theme",
                        tipPosition: "nw"
                    }, {
                        icon: '<svg><use xlink:href="#vditor-icon-code-theme"></use></svg>',
                        name: "code-theme",
                        tipPosition: "nw"
                    }, {
                        icon: '<svg><use xlink:href="#vditor-icon-bug"></use></svg>',
                        name: "devtools",
                        tipPosition: "nw"
                    }, {
                        icon: '<svg><use xlink:href="#vditor-icon-info"></use></svg>',
                        name: "info",
                        tipPosition: "nw"
                    }, {
                        icon: '<svg><use xlink:href="#vditor-icon-help"></use></svg>',
                        name: "help",
                        tipPosition: "nw"
                    }, {name: "br"}], r = [];
                    return e.forEach((function (e) {
                        var i = e;
                        n.forEach((function (t) {
                            "string" == typeof e && t.name === e && (i = t), "object" == typeof e && t.name === e.name && (i = Object.assign({}, t, e))
                        })), e.toolbar && (i.toolbar = t.mergeToolbar(e.toolbar)), r.push(i)
                    })), r
                }, e
            }(), Gn = function () {
                function e(e) {
                    var t = this;
                    this.composingLock = !1, this.commentIds = [];
                    var n = document.createElement("div");
                    n.className = "vditor-wysiwyg", n.innerHTML = '<pre class="vditor-reset" placeholder="' + e.options.placeholder + '"\n contenteditable="true" spellcheck="false"></pre>\n<div class="vditor-panel vditor-panel--none"></div>\n<div class="vditor-panel vditor-panel--none">\n    <button type="button" aria-label="' + window.VditorI18n.comment + '" class="vditor-icon vditor-tooltipped vditor-tooltipped__n">\n        <svg><use xlink:href="#vditor-icon-comment"></use></svg>\n    </button>\n</div>', this.element = n.firstElementChild, this.popover = n.firstElementChild.nextElementSibling, this.selectPopover = n.lastElementChild, this.bindEvent(e), ke(e, this.element), Se(e, this.element), Le(e, this.element), _e(e, this.element), xe(e, this.element), Ce(e, this.element), Te(e, this.element, this.copy), Me(e, this.element, this.copy), e.options.comment.enable && (this.selectPopover.querySelector("button").onclick = function () {
                        var n, r, o = Lute.NewNodeID(), a = getSelection().getRangeAt(0), l = a.cloneRange(),
                            s = a.extractContents(), d = !1, c = !1;
                        s.childNodes.forEach((function (e, t) {
                            var i = !1;
                            if (3 === e.nodeType ? i = !0 : e.classList.contains("vditor-comment") ? e.classList.contains("vditor-comment") && e.setAttribute("data-cmtids", e.getAttribute("data-cmtids") + " " + o) : i = !0, i) if (3 !== e.nodeType && "0" === e.getAttribute("data-block") && 0 === t && l.startOffset > 0) e.innerHTML = '<span class="vditor-comment" data-cmtids="' + o + '">' + e.innerHTML + "</span>", n = e; else if (3 !== e.nodeType && "0" === e.getAttribute("data-block") && t === s.childNodes.length - 1 && l.endOffset < l.endContainer.textContent.length) e.innerHTML = '<span class="vditor-comment" data-cmtids="' + o + '">' + e.innerHTML + "</span>", r = e; else if (3 !== e.nodeType && "0" === e.getAttribute("data-block")) 0 === t ? d = !0 : t === s.childNodes.length - 1 && (c = !0), e.innerHTML = '<span class="vditor-comment" data-cmtids="' + o + '">' + e.innerHTML + "</span>"; else {
                                var a = document.createElement("span");
                                a.classList.add("vditor-comment"), a.setAttribute("data-cmtids", o), e.parentNode.insertBefore(a, e), a.appendChild(e)
                            }
                        }));
                        var u = (0, y.F9)(l.startContainer);
                        u && (n ? (u.insertAdjacentHTML("beforeend", n.innerHTML), n.remove()) : "" === u.textContent.trim().replace(i.g.ZWSP, "") && d && u.remove());
                        var p = (0, y.F9)(l.endContainer);
                        p && (r ? (p.insertAdjacentHTML("afterbegin", r.innerHTML), r.remove()) : "" === p.textContent.trim().replace(i.g.ZWSP, "") && c && p.remove()), a.insertNode(s), e.options.comment.add(o, a.toString(), t.getComments(e, !0)), Y(e, {
                            enableAddUndoStack: !0,
                            enableHint: !1,
                            enableInput: !1
                        }), t.hideComment()
                    })
                }

                return e.prototype.getComments = function (e, t) {
                    var n = this;
                    if (void 0 === t && (t = !1), "wysiwyg" !== e.currentMode || !e.options.comment.enable) return [];
                    this.commentIds = [], this.element.querySelectorAll(".vditor-comment").forEach((function (e) {
                        n.commentIds = n.commentIds.concat(e.getAttribute("data-cmtids").split(" "))
                    })), this.commentIds = Array.from(new Set(this.commentIds));
                    var r = [];
                    return t ? (this.commentIds.forEach((function (e) {
                        r.push({
                            id: e,
                            top: n.element.querySelector('.vditor-comment[data-cmtids="' + e + '"]').offsetTop
                        })
                    })), r) : void 0
                }, e.prototype.triggerRemoveComment = function (e) {
                    var t, n, r;
                    if ("wysiwyg" === e.currentMode && e.options.comment.enable && e.wysiwyg.commentIds.length > 0) {
                        var i = JSON.parse(JSON.stringify(this.commentIds));
                        this.getComments(e);
                        var o = (t = i, n = this.commentIds, r = new Set(n), t.filter((function (e) {
                            return !r.has(e)
                        })));
                        o.length > 0 && e.options.comment.remove(o)
                    }
                }, e.prototype.showComment = function () {
                    var e = (0, D.Ny)(this.element);
                    this.selectPopover.setAttribute("style", "left:" + e.left + "px;display:block;top:" + Math.max(-8, e.top - 21) + "px")
                }, e.prototype.hideComment = function () {
                    this.selectPopover.setAttribute("style", "display:none")
                }, e.prototype.unbindListener = function () {
                    window.removeEventListener("scroll", this.scrollListener)
                }, e.prototype.copy = function (e, t) {
                    var n = getSelection().getRangeAt(0);
                    if ("" !== n.toString()) {
                        e.stopPropagation(), e.preventDefault();
                        var r = (0, y.lG)(n.startContainer, "CODE"), i = (0, y.lG)(n.endContainer, "CODE");
                        if (r && i && i.isSameNode(r)) {
                            var o = "";
                            return o = "PRE" === r.parentElement.tagName ? n.toString() : "`" + n.toString() + "`", e.clipboardData.setData("text/plain", o), void e.clipboardData.setData("text/html", "")
                        }
                        var a = (0, y.lG)(n.startContainer, "A"), l = (0, y.lG)(n.endContainer, "A");
                        if (a && l && l.isSameNode(a)) {
                            var s = a.getAttribute("title") || "";
                            return s && (s = ' "' + s + '"'), e.clipboardData.setData("text/plain", "[" + n.toString() + "](" + a.getAttribute("href") + s + ")"), void e.clipboardData.setData("text/html", "")
                        }
                        var d = document.createElement("div");
                        d.appendChild(n.cloneContents()), e.clipboardData.setData("text/plain", t.lute.VditorDOM2Md(d.innerHTML).trim()), e.clipboardData.setData("text/html", "")
                    }
                }, e.prototype.bindEvent = function (e) {
                    var t = this;
                    this.unbindListener(), window.addEventListener("scroll", this.scrollListener = function () {
                        if (v(e, ["hint"]), "block" === t.popover.style.display && "block" === t.selectPopover.style.display) {
                            var n = parseInt(t.popover.getAttribute("data-top"), 10);
                            if ("auto" === e.options.height) {
                                if (e.options.toolbarConfig.pin) {
                                    var r = Math.max(n, window.scrollY - e.element.offsetTop - 8) + "px";
                                    "block" === t.popover.style.display && (t.popover.style.top = r), "block" === t.selectPopover.style.display && (t.selectPopover.style.top = r)
                                }
                            } else if (e.options.toolbarConfig.pin && 0 === e.toolbar.element.getBoundingClientRect().top) {
                                var i = Math.max(window.scrollY - e.element.offsetTop - 8, Math.min(n - e.wysiwyg.element.scrollTop, t.element.clientHeight - 21)) + "px";
                                "block" === t.popover.style.display && (t.popover.style.top = i), "block" === t.selectPopover.style.display && (t.selectPopover.style.top = i)
                            }
                        }
                    }), this.element.addEventListener("scroll", (function () {
                        if (v(e, ["hint"]), e.options.comment && e.options.comment.enable && e.options.comment.scroll && e.options.comment.scroll(e.wysiwyg.element.scrollTop), "block" === t.popover.style.display) {
                            var n = parseInt(t.popover.getAttribute("data-top"), 10) - e.wysiwyg.element.scrollTop,
                                r = -8;
                            e.options.toolbarConfig.pin && 0 === e.toolbar.element.getBoundingClientRect().top && (r = window.scrollY - e.element.offsetTop + r);
                            var i = Math.max(r, Math.min(n, t.element.clientHeight - 21)) + "px";
                            t.popover.style.top = i, t.selectPopover.style.top = i
                        }
                    })), this.element.addEventListener("paste", (function (t) {
                        Ct(e, t, {
                            pasteCode: function (t) {
                                var n = (0, D.zh)(e), r = document.createElement("template");
                                r.innerHTML = t, n.insertNode(r.content.cloneNode(!0));
                                var i = (0, y.a1)(n.startContainer, "data-block", "0");
                                i ? i.outerHTML = e.lute.SpinVditorDOM(i.outerHTML) : e.wysiwyg.element.innerHTML = e.lute.SpinVditorDOM(e.wysiwyg.element.innerHTML), (0, D.ib)(e.wysiwyg.element, n)
                            }
                        })
                    })), this.element.addEventListener("compositionstart", (function () {
                        t.composingLock = !0
                    })), this.element.addEventListener("compositionend", (function (n) {
                        var r = (0, b.W)(getSelection().getRangeAt(0).startContainer);
                        r && "" === r.textContent ? O(e) : ((0, d.vU)() || ze(e, getSelection().getRangeAt(0).cloneRange(), n), t.composingLock = !1)
                    })), this.element.addEventListener("input", (function (n) {
                        if ("deleteByDrag" !== n.inputType && "insertFromDrop" !== n.inputType) {
                            if (t.preventInput) return t.preventInput = !1, void Y(e);
                            if (t.composingLock || "‘" === n.data || "“" === n.data || "《" === n.data) Y(e); else {
                                var r = getSelection().getRangeAt(0), i = (0, y.F9)(r.startContainer);
                                if (i || (ee(e, r), i = (0, y.F9)(r.startContainer)), i) {
                                    for (var o = (0, D.im)(i, e.wysiwyg.element, r).start, l = !0, s = o - 1; s > i.textContent.substr(0, o).lastIndexOf("\n"); s--) if (" " !== i.textContent.charAt(s) && "\t" !== i.textContent.charAt(s)) {
                                        l = !1;
                                        break
                                    }
                                    0 === o && (l = !1);
                                    var d = !0;
                                    for (s = o - 1; s < i.textContent.length; s++) if (" " !== i.textContent.charAt(s) && "\n" !== i.textContent.charAt(s)) {
                                        d = !1;
                                        break
                                    }
                                    var c = (0, b.W)(getSelection().getRangeAt(0).startContainer);
                                    c && "" === c.textContent && (O(e), c.remove()), l && "code-block" !== i.getAttribute("data-type") || d || st(i.innerHTML) || lt(i.innerHTML) && i.previousElementSibling ? "function" == typeof e.options.input && e.options.input(a(e)) : ze(e, r, n)
                                }
                            }
                        }
                    })), this.element.addEventListener("click", (function (n) {
                        if ("INPUT" === n.target.tagName) {
                            var r = n.target;
                            return r.checked ? r.setAttribute("checked", "checked") : r.removeAttribute("checked"), t.preventInput = !0, void Y(e)
                        }
                        if ("IMG" !== n.target.tagName || n.target.parentElement.classList.contains("vditor-wysiwyg__preview")) {
                            if ("A" === n.target.tagName) return e.options.link.click ? e.options.link.click(n.target) : e.options.link.isOpen && window.open(n.target.getAttribute("href")), void n.preventDefault();
                            var o = (0, D.zh)(e);
                            if (n.target.isEqualNode(t.element) && t.element.lastElementChild && o.collapsed) {
                                var a = t.element.lastElementChild.getBoundingClientRect();
                                n.y > a.top + a.height && ("P" === t.element.lastElementChild.tagName && "" === t.element.lastElementChild.textContent.trim().replace(i.g.ZWSP, "") ? (o.selectNodeContents(t.element.lastElementChild), o.collapse(!1)) : (t.element.insertAdjacentHTML("beforeend", '<p data-block="0">' + i.g.ZWSP + "<wbr></p>"), (0, D.ib)(t.element, o)))
                            }
                            oe(e);
                            var l = (0, y.fb)(n.target, "vditor-wysiwyg__preview");
                            l || (l = (0, y.fb)((0, D.zh)(e).startContainer, "vditor-wysiwyg__preview")), l && re(l, e), I(n, e)
                        } else "link-ref" === n.target.getAttribute("data-type") ? le(e, n.target) : function (e, t) {
                            var n = e.target;
                            t.wysiwyg.popover.innerHTML = "";
                            var r = function () {
                                n.setAttribute("src", o.value), n.setAttribute("alt", l.value), n.setAttribute("title", d.value)
                            }, i = document.createElement("span");
                            i.setAttribute("aria-label", window.VditorI18n.imageURL), i.className = "vditor-tooltipped vditor-tooltipped__n";
                            var o = document.createElement("input");
                            i.appendChild(o), o.className = "vditor-input", o.setAttribute("placeholder", window.VditorI18n.imageURL), o.value = n.getAttribute("src") || "", o.oninput = function () {
                                r()
                            }, o.onkeydown = function (e) {
                                ie(t, e)
                            };
                            var a = document.createElement("span");
                            a.setAttribute("aria-label", window.VditorI18n.alternateText), a.className = "vditor-tooltipped vditor-tooltipped__n";
                            var l = document.createElement("input");
                            a.appendChild(l), l.className = "vditor-input", l.setAttribute("placeholder", window.VditorI18n.alternateText), l.style.width = "52px", l.value = n.getAttribute("alt") || "", l.oninput = function () {
                                r()
                            }, l.onkeydown = function (e) {
                                ie(t, e)
                            };
                            var s = document.createElement("span");
                            s.setAttribute("aria-label", window.VditorI18n.title), s.className = "vditor-tooltipped vditor-tooltipped__n";
                            var d = document.createElement("input");
                            s.appendChild(d), d.className = "vditor-input", d.setAttribute("placeholder", window.VditorI18n.title), d.value = n.getAttribute("title") || "", d.oninput = function () {
                                r()
                            }, d.onkeydown = function (e) {
                                ie(t, e)
                            }, ce(n, t), t.wysiwyg.popover.insertAdjacentElement("beforeend", i), t.wysiwyg.popover.insertAdjacentElement("beforeend", a), t.wysiwyg.popover.insertAdjacentElement("beforeend", s), ae(t, n)
                        }(n, e)
                    })), this.element.addEventListener("keyup", (function (t) {
                        if (!t.isComposing && !(0, d.yl)(t)) {
                            "Enter" === t.key && Ae(e), "Backspace" !== t.key && "Delete" !== t.key || "" === e.wysiwyg.element.innerHTML || 1 !== e.wysiwyg.element.childNodes.length || !e.wysiwyg.element.firstElementChild || "P" !== e.wysiwyg.element.firstElementChild.tagName || 0 !== e.wysiwyg.element.firstElementChild.childElementCount || "" !== e.wysiwyg.element.textContent && "\n" !== e.wysiwyg.element.textContent || (e.wysiwyg.element.innerHTML = "");
                            var n = (0, D.zh)(e);
                            if ("Backspace" === t.key && (0, d.vU)() && "\n" === n.startContainer.textContent && 1 === n.startOffset && (n.startContainer.textContent = ""), ee(e, n), oe(e), "ArrowDown" === t.key || "ArrowRight" === t.key || "Backspace" === t.key || "ArrowLeft" === t.key || "ArrowUp" === t.key) {
                                "ArrowLeft" !== t.key && "ArrowRight" !== t.key || e.hint.render(e);
                                var r = (0, y.fb)(n.startContainer, "vditor-wysiwyg__preview");
                                if (!r && 3 !== n.startContainer.nodeType && n.startOffset > 0) (o = n.startContainer).classList.contains("vditor-wysiwyg__block") && (r = o.lastElementChild);
                                if (r) if ("none" !== r.previousElementSibling.style.display) {
                                    var i = r.previousElementSibling;
                                    if ("PRE" === i.tagName && (i = i.firstElementChild), "ArrowDown" === t.key || "ArrowRight" === t.key) {
                                        var o, a = function (e) {
                                            for (var t = e; t && !t.nextSibling;) t = t.parentElement;
                                            return t.nextSibling
                                        }(o = r.parentElement);
                                        if (a && 3 !== a.nodeType) {
                                            var l = a.querySelector(".vditor-wysiwyg__preview");
                                            if (l) return void re(l, e)
                                        }
                                        if (3 === a.nodeType) {
                                            for (; 0 === a.textContent.length && a.nextSibling;) a = a.nextSibling;
                                            n.setStart(a, 1)
                                        } else n.setStart(a.firstChild, 0)
                                    } else n.selectNodeContents(i), n.collapse(!1)
                                } else "ArrowDown" === t.key || "ArrowRight" === t.key ? re(r, e) : re(r, e, !1)
                            }
                        }
                    }))
                }, e
            }(), Kn = function () {
                var e = function (t, n) {
                    return e = Object.setPrototypeOf || {__proto__: []} instanceof Array && function (e, t) {
                        e.__proto__ = t
                    } || function (e, t) {
                        for (var n in t) t.hasOwnProperty(n) && (e[n] = t[n])
                    }, e(t, n)
                };
                return function (t, n) {
                    function r() {
                        this.constructor = t
                    }

                    e(t, n), t.prototype = null === n ? Object.create(n) : (r.prototype = n.prototype, new r)
                }
            }();
            const Fn = function (e) {
                function t(t, n) {
                    var r = e.call(this) || this;
                    r.version = i.H, "string" == typeof t && (n ? n.cache ? n.cache.id || (n.cache.id = "vditor" + t) : n.cache = {id: "vditor" + t} : n = {cache: {id: "vditor" + t}}, t = document.getElementById(t));
                    var o = new zn(n).merge();
                    if (o.i18n) window.VditorI18n = o.i18n, r.init(t, o); else {
                        if (!["en_US", "fr_FR", "pt_BR", "ja_JP", "ko_KR", "ru_RU", "sv_SE", "zh_CN", "zh_TW"].includes(o.lang)) throw new Error("options.lang error, see https://ld246.com/article/1549638745630#options");
                        var a = "vditorI18nScript", s = a + o.lang;
                        document.querySelectorAll('head script[id^="vditorI18nScript"]').forEach((function (e) {
                            e.id !== s && document.head.removeChild(e)
                        })), (0, l.G)(o.cdn + "/dist/js/i18n/" + o.lang + ".js", s).then((function () {
                            r.init(t, o)
                        }))
                    }
                    return r
                }

                return Kn(t, e), t.prototype.setTheme = function (e, t, n, r) {
                    this.vditor.options.theme = e, W(this.vditor), t && (this.vditor.options.preview.theme.current = t, (0, U.Z)(t, r || this.vditor.options.preview.theme.path)), n && (this.vditor.options.preview.hljs.style = n, (0, Zt.Y)(n, this.vditor.options.cdn))
                }, t.prototype.getValue = function () {
                    return a(this.vditor)
                }, t.prototype.getCurrentMode = function () {
                    return this.vditor.currentMode
                }, t.prototype.focus = function () {
                    "sv" === this.vditor.currentMode ? this.vditor.sv.element.focus() : "wysiwyg" === this.vditor.currentMode ? this.vditor.wysiwyg.element.focus() : "ir" === this.vditor.currentMode && this.vditor.ir.element.focus()
                }, t.prototype.blur = function () {
                    "sv" === this.vditor.currentMode ? this.vditor.sv.element.blur() : "wysiwyg" === this.vditor.currentMode ? this.vditor.wysiwyg.element.blur() : "ir" === this.vditor.currentMode && this.vditor.ir.element.blur()
                }, t.prototype.disabled = function () {
                    v(this.vditor, ["subToolbar", "hint", "popover"]), m(this.vditor.toolbar.elements, i.g.EDIT_TOOLBARS.concat(["undo", "redo", "fullscreen", "edit-mode"])), this.vditor[this.vditor.currentMode].element.setAttribute("contenteditable", "false")
                }, t.prototype.enable = function () {
                    p(this.vditor.toolbar.elements, i.g.EDIT_TOOLBARS.concat(["undo", "redo", "fullscreen", "edit-mode"])), this.vditor.undo.resetIcon(this.vditor), this.vditor[this.vditor.currentMode].element.setAttribute("contenteditable", "true")
                }, t.prototype.getSelection = function () {
                    return "wysiwyg" === this.vditor.currentMode ? Ee(this.vditor.wysiwyg.element) : "sv" === this.vditor.currentMode ? Ee(this.vditor.sv.element) : "ir" === this.vditor.currentMode ? Ee(this.vditor.ir.element) : void 0
                }, t.prototype.renderPreview = function (e) {
                    this.vditor.preview.render(this.vditor, e)
                }, t.prototype.getCursorPosition = function () {
                    return (0, D.Ny)(this.vditor[this.vditor.currentMode].element)
                }, t.prototype.isUploading = function () {
                    return this.vditor.upload.isUploading
                }, t.prototype.clearCache = function () {
                    localStorage.removeItem(this.vditor.options.cache.id)
                }, t.prototype.disabledCache = function () {
                    this.vditor.options.cache.enable = !1
                }, t.prototype.enableCache = function () {
                    if (!this.vditor.options.cache.id) throw new Error("need options.cache.id, see https://ld246.com/article/1549638745630#options");
                    this.vditor.options.cache.enable = !0
                }, t.prototype.html2md = function (e) {
                    return this.vditor.lute.HTML2Md(e)
                }, t.prototype.exportJSON = function (e) {
                    return this.vditor.lute.RenderJSON(e)
                }, t.prototype.getHTML = function () {
                    return It(this.vditor)
                }, t.prototype.tip = function (e, t) {
                    this.vditor.tip.show(e, t)
                }, t.prototype.setPreviewMode = function (e) {
                    zt(e, this.vditor)
                }, t.prototype.deleteValue = function () {
                    window.getSelection().isCollapsed || document.execCommand("delete", !1)
                }, t.prototype.updateValue = function (e) {
                    document.execCommand("insertHTML", !1, e)
                }, t.prototype.insertValue = function (e, t) {
                    void 0 === t && (t = !0);
                    var n = (0, D.zh)(this.vditor);
                    n.collapse(!0);
                    var r = document.createElement("template");
                    r.innerHTML = e, n.insertNode(r.content.cloneNode(!0)), "sv" === this.vditor.currentMode ? (this.vditor.sv.preventInput = !0, t && V(this.vditor)) : "wysiwyg" === this.vditor.currentMode ? (this.vditor.wysiwyg.preventInput = !0, t && ze(this.vditor, getSelection().getRangeAt(0))) : "ir" === this.vditor.currentMode && (this.vditor.ir.preventInput = !0, t && R(this.vditor, getSelection().getRangeAt(0), !0))
                }, t.prototype.setValue = function (e, t) {
                    var n = this;
                    void 0 === t && (t = !1), "sv" === this.vditor.currentMode ? (this.vditor.sv.element.innerHTML = "<div data-block='0'>" + this.vditor.lute.SpinVditorSVDOM(e) + "</div>", Ie(this.vditor, {
                        enableAddUndoStack: !0,
                        enableHint: !1,
                        enableInput: !1
                    })) : "wysiwyg" === this.vditor.currentMode ? he(this.vditor, e, {
                        enableAddUndoStack: !0,
                        enableHint: !1,
                        enableInput: !1
                    }) : (this.vditor.ir.element.innerHTML = this.vditor.lute.Md2VditorIRDOM(e), this.vditor.ir.element.querySelectorAll(".vditor-ir__preview[data-render='2']").forEach((function (e) {
                        N(e, n.vditor)
                    })), Mt(this.vditor, {
                        enableAddUndoStack: !0,
                        enableHint: !1,
                        enableInput: !1
                    })), this.vditor.outline.render(this.vditor), e || (v(this.vditor, ["emoji", "headings", "submenu", "hint"]), this.vditor.wysiwyg.popover && (this.vditor.wysiwyg.popover.style.display = "none"), this.clearCache()), t && this.clearStack()
                }, t.prototype.clearStack = function () {
                    this.vditor.undo.clearStack(this.vditor), this.vditor.undo.addToUndoStack(this.vditor)
                }, t.prototype.destroy = function () {
                    this.vditor.element.innerHTML = this.vditor.originalInnerHTML, this.vditor.element.classList.remove("vditor"), this.vditor.element.removeAttribute("style");
                    var e = document.getElementById("vditorIconScript");
                    e && e.remove(), this.clearCache(), K(), this.vditor.wysiwyg.unbindListener()
                }, t.prototype.getCommentIds = function () {
                    return "wysiwyg" !== this.vditor.currentMode ? [] : this.vditor.wysiwyg.getComments(this.vditor, !0)
                }, t.prototype.hlCommentIds = function (e) {
                    if ("wysiwyg" === this.vditor.currentMode) {
                        var t = function (t) {
                            t.classList.remove("vditor-comment--hover"), e.forEach((function (e) {
                                t.getAttribute("data-cmtids").indexOf(e) > -1 && t.classList.add("vditor-comment--hover")
                            }))
                        };
                        this.vditor.wysiwyg.element.querySelectorAll(".vditor-comment").forEach((function (e) {
                            t(e)
                        })), "none" !== this.vditor.preview.element.style.display && this.vditor.preview.element.querySelectorAll(".vditor-comment").forEach((function (e) {
                            t(e)
                        }))
                    }
                }, t.prototype.unHlCommentIds = function (e) {
                    if ("wysiwyg" === this.vditor.currentMode) {
                        var t = function (t) {
                            e.forEach((function (e) {
                                t.getAttribute("data-cmtids").indexOf(e) > -1 && t.classList.remove("vditor-comment--hover")
                            }))
                        };
                        this.vditor.wysiwyg.element.querySelectorAll(".vditor-comment").forEach((function (e) {
                            t(e)
                        })), "none" !== this.vditor.preview.element.style.display && this.vditor.preview.element.querySelectorAll(".vditor-comment").forEach((function (e) {
                            t(e)
                        }))
                    }
                }, t.prototype.removeCommentIds = function (e) {
                    var t = this;
                    if ("wysiwyg" === this.vditor.currentMode) {
                        var n = function (e, n) {
                            var r = e.getAttribute("data-cmtids").split(" ");
                            r.find((function (e, t) {
                                if (e === n) return r.splice(t, 1), !0
                            })), 0 === r.length ? (e.outerHTML = e.innerHTML, (0, D.zh)(t.vditor).collapse(!0)) : e.setAttribute("data-cmtids", r.join(" "))
                        };
                        e.forEach((function (e) {
                            t.vditor.wysiwyg.element.querySelectorAll(".vditor-comment").forEach((function (t) {
                                n(t, e)
                            })), "none" !== t.vditor.preview.element.style.display && t.vditor.preview.element.querySelectorAll(".vditor-comment").forEach((function (t) {
                                n(t, e)
                            }))
                        })), Y(this.vditor, {enableAddUndoStack: !0, enableHint: !1, enableInput: !1})
                    }
                }, t.prototype.init = function (e, t) {
                    var n = this;
                    this.vditor = {
                        currentMode: t.mode,
                        element: e,
                        hint: new Dt(t.hint.extend),
                        lute: void 0,
                        options: t,
                        originalInnerHTML: e.innerHTML,
                        outline: new Pt(window.VditorI18n.outline),
                        tip: new Wt
                    }, this.vditor.sv = new Ut(this.vditor), this.vditor.undo = new Un, this.vditor.wysiwyg = new Gn(this.vditor), this.vditor.ir = new Ot(this.vditor), this.vditor.toolbar = new Bn(this.vditor), t.resize.enable && (this.vditor.resize = new Vt(this.vditor)), this.vditor.toolbar.elements.devtools && (this.vditor.devtools = new s), (t.upload.url || t.upload.handler) && (this.vditor.upload = new Ue), (0, l.G)(t._lutePath || t.cdn + "/dist/js/lute/lute.min.js", "vditorLuteScript").then((function () {
                        n.vditor.lute = (0, jt.X)({
                            autoSpace: n.vditor.options.preview.markdown.autoSpace,
                            gfmAutoLink: n.vditor.options.preview.markdown.gfmAutoLink,
                            codeBlockPreview: n.vditor.options.preview.markdown.codeBlockPreview,
                            emojiSite: n.vditor.options.hint.emojiPath,
                            emojis: n.vditor.options.hint.emoji,
                            fixTermTypo: n.vditor.options.preview.markdown.fixTermTypo,
                            footnotes: n.vditor.options.preview.markdown.footnotes,
                            headingAnchor: !1,
                            inlineMathDigit: n.vditor.options.preview.math.inlineDigit,
                            linkBase: n.vditor.options.preview.markdown.linkBase,
                            linkPrefix: n.vditor.options.preview.markdown.linkPrefix,
                            listStyle: n.vditor.options.preview.markdown.listStyle,
                            mark: n.vditor.options.preview.markdown.mark,
                            mathBlockPreview: n.vditor.options.preview.markdown.mathBlockPreview,
                            paragraphBeginningSpace: n.vditor.options.preview.markdown.paragraphBeginningSpace,
                            sanitize: n.vditor.options.preview.markdown.sanitize,
                            toc: n.vditor.options.preview.markdown.toc
                        }), n.vditor.preview = new Bt(n.vditor), function (e) {
                            e.element.innerHTML = "", e.element.classList.add("vditor"), e.options.rtl && e.element.setAttribute("dir", "rtl"), W(e), (0, U.Z)(e.options.preview.theme.current, e.options.preview.theme.path), "number" == typeof e.options.height ? e.element.style.height = e.options.height + "px" : e.element.style.height = e.options.height, "number" == typeof e.options.minHeight && (e.element.style.minHeight = e.options.minHeight + "px"), "number" == typeof e.options.width ? e.element.style.width = e.options.width + "px" : e.element.style.width = e.options.width, e.element.appendChild(e.toolbar.element);
                            var t = document.createElement("div");
                            if (t.className = "vditor-content", "left" === e.options.outline.position && t.appendChild(e.outline.element), t.appendChild(e.wysiwyg.element.parentElement), t.appendChild(e.sv.element), t.appendChild(e.ir.element.parentElement), t.appendChild(e.preview.element), e.toolbar.elements.devtools && t.appendChild(e.devtools.element), "right" === e.options.outline.position && (e.outline.element.classList.add("vditor-outline--right"), t.appendChild(e.outline.element)), e.upload && t.appendChild(e.upload.element), e.options.resize.enable && t.appendChild(e.resize.element), t.appendChild(e.hint.element), t.appendChild(e.tip.element), e.element.appendChild(t), t.addEventListener("click", (function () {
                                v(e, ["subToolbar"])
                            })), e.toolbar.elements.export && e.element.insertAdjacentHTML("beforeend", '<iframe id="vditorExportIframe" style="width: 100%;height: 0;border: 0"></iframe>'), be(e, e.options.mode, J(e)), document.execCommand("DefaultParagraphSeparator", !1, "p"), navigator.userAgent.indexOf("iPhone") > -1 && void 0 !== window.visualViewport) {
                                var n = !1, r = function (t) {
                                    n || (n = !0, requestAnimationFrame((function () {
                                        n = !1;
                                        var t = e.toolbar.element;
                                        t.style.transform = "none", t.getBoundingClientRect().top < 0 && (t.style.transform = "translate(0, " + -t.getBoundingClientRect().top + "px)")
                                    })))
                                };
                                window.visualViewport.addEventListener("scroll", r), window.visualViewport.addEventListener("resize", r)
                            }
                        }(n.vditor), t.after && t.after(), t.icon && (0, l.J)(t.cdn + "/dist/js/icons/" + t.icon + ".js", "vditorIconScript")
                    }))
                }, t
            }(t.default)
        })(), r = r.default
    })()
}));